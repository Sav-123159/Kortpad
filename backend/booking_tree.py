import threading
from datetime import datetime, time, timedelta
from tracemalloc import start

from database import get_db
from models import Booking

# ==================== ROOI-SWART BOOM vir BESPREKINGS ====================
# Elke lokaal het sy eie Rooi-Swart Boom (RBTree), gestoor in BookingCache.
#
# Ons werk net met uur-gleuwe. 'n Bespreking word opgebreek in een node per uur:
#       09:00 - 11:30  ->  gleuwe 09:00, 10:00, 11:00   (begin rond af, einde rond op)
#
#   Key   => (gleuf_tyd, booking_id)   -> die booking_id breek gelykopes
#   Value => die Booking objek
#
# 'n Nuwe bespreking bots as enige van sy uur-gleuwe alreeds in die boom is.
# Dit is 'n reeks-navraag (range query): O(log n + k)

RED = True
BLACK = False

# ==================== UUR LOGIKA ====================
# Begin tyd word AFGEROND (10:30 -> 10:00), eind tyd word OPGEROND (11:30 -> 12:00)

# hou die uur van 'n datetime, met minute, sekondes en microsekondes op nul
def hour_floor(dt: datetime) -> datetime:
    return dt.replace(minute=0, second=0, microsecond=0)

# hou die uur van 'n datetime, met minute, sekondes en microsekondes op nul, en verhoog dit met een uur as dit nie alreeds op die uur is nie
def hour_ceiling(dt: datetime) -> datetime:
    floor = hour_floor(dt)
    return floor if floor == dt else floor + timedelta(hours=1)

# Gee die begin en einde van die uur-gleuwe wat 'n bespreking beslaan
def hour_window(day, start_time, end_time):
    return (
        hour_floor(datetime.combine(day, start_time)),
        hour_ceiling(datetime.combine(day, end_time)),
    )

# Gee elke uur-gleuf wat 'n bespreking beslaan
def hour_slots(day, start_time, end_time):
    current, end = hour_window(day, start_time, end_time)
    while current < end:
        yield current
        current += timedelta(hours=1)

# ==================== RB-Tree ====================
# 'n Selfbalanserende binêre soekboom. Reëls:
#   1. Elke node is rooi of swart
#   2. Die wortel is swart
#   3. 'n Rooi node het nooit 'n rooi kind nie
#   4. Elke pad van 'n node af tot by 'n leë blaar het dieselfde aantal swart nodes
# Dit hou die hoogte <= 2 * log2(n + 1), dus is alles O(log n)

# NIL is een gedeelde swart "leë blaar" node, sodat ons nie oral op None hoef te toets nie.
# Geen delete nie: BookingCache gooi 'n hele boom weg en laai dit weer vanaf die databasis.

# _Node is 'n interne klas wat die nodes van die boom voorstel. Dit het slegs die velde wat nodig is vir die boom se werking.
class _Node:
    __slots__ = ("key", "value", "color", "left", "right", "parent")

    def __init__(self, key, value, color):
        self.key = key
        self.value = value
        self.color = color
        self.left = self.right = self.parent = None

# RBTree is die Rooi-Swart Boom self. Dit het slegs die metodes wat nodig is vir BookingCache.
class RBTree:
    # ---------- initialisering ----------
    def __init__(self):
        self.NIL = _Node(None, None, BLACK)
        self.NIL.left = self.NIL.right = self.NIL.parent = self.NIL
        self.root = self.NIL
        self._size = 0

    def __len__(self):
        return self._size

    # ---------- rotasies ----------
    # Verander watter node bo-op sit, maar hou die links-na-regs volgorde dieselfde

    # rotate left: maak die regter kind van x bo-op sit, en maak x die linkerkind van sy ouer
    def _rotate_left(self, x):
        y = x.right
        x.right = y.left
        if y.left is not self.NIL:
            y.left.parent = x

        y.parent = x.parent
        if x.parent is self.NIL:
            self.root = y
        elif x is x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y

        y.left = x
        x.parent = y

    # rotate right: maak die linkerkind van x bo-op sit, en maak x die regterkind van sy ouer
    def _rotate_right(self, x):
        y = x.left
        x.left = y.right
        if y.right is not self.NIL:
            y.right.parent = x

        y.parent = x.parent
        if x.parent is self.NIL:
            self.root = y
        elif x is x.parent.right:
            x.parent.right = y
        else:
            x.parent.left = y

        y.right = x
        x.parent = y

    # ---------- insert ----------
    def insert(self, key, value):
        # 1. Gewone BST invoeging
        parent = self.NIL
        current = self.root
        while current is not self.NIL:
            parent = current
            if key == current.key:
                current.value = value  # sleutel bestaan alreeds - vervang net die waarde
                return
            current = current.left if key < current.key else current.right

        # 2. Nuwe node is altyd ROOI (dit breek nooit reël 4 nie)
        node = _Node(key, value, RED)
        node.left = node.right = self.NIL
        node.parent = parent

        if parent is self.NIL:
            self.root = node
        elif key < parent.key:
            parent.left = node
        else:
            parent.right = node

        self._size += 1

        # 3. Herstel reël 3 (rooi ouer met rooi kind) as dit nodig is
        self._fix_insert(node)

    # Herstel reël 3 (rooi ouer met rooi kind) na 'n invoeging. Dit kan 'n paar herkleurings en rotasies behels.
    def _fix_insert(self, node):
        while node.parent.color == RED:
            parent = node.parent
            grandparent = parent.parent

            if parent is grandparent.left:
                # uncle is die regter kind van die grandparent
                uncle = grandparent.right

                if uncle.color == RED:
                    # uncle is rooi - herkleur en gaan een vlak op
                    parent.color = BLACK
                    uncle.color = BLACK
                    grandparent.color = RED
                    node = grandparent
                else:
                    # uncle is swart: rotasie
                    if node is parent.right:  # "binne" kind - maak eers 'n reguit lyn
                        node = parent
                        self._rotate_left(node)
                        parent = node.parent
                    parent.color = BLACK
                    grandparent.color = RED
                    self._rotate_right(grandparent)
            else:
                uncle = grandparent.left

                if uncle.color == RED:
                    parent.color = BLACK
                    uncle.color = BLACK
                    grandparent.color = RED
                    node = grandparent
                else:
                    if node is parent.left:
                        node = parent
                        self._rotate_right(node)
                        parent = node.parent
                    parent.color = BLACK
                    grandparent.color = RED
                    self._rotate_left(grandparent)

        self.root.color = BLACK

    # ---------- range query ----------
    # Gee al die waardes met lo <= key < hi, gesorteer op key.
    # Sub-bome wat nie kan pas nie word oorgeslaan -> O(log n + k)
    
    # range() is die publieke metode wat die gebruiker van die boom kan aanroep. Dit skep 'n leë lys en roep die interne _range() metode.
    def range(self, lo, hi):
        result = []
        self._range(self.root, lo, hi, result)
        return result

    # _range() is die interne metode wat die boom deursoek. Dit gebruik in-order traversering en voeg waardes by result as hulle binne die interval is.
    def _range(self, node, lo, hi, result):
        if node is self.NIL:
            return
        if lo < node.key:  # links is net iets as daar keys kleiner as node.key kan wees wat nog >= lo is
            self._range(node.left, lo, hi, result)
        if lo <= node.key < hi:
            result.append(node.value)
        if node.key < hi:  # regs is net iets as daar keys groter as node.key kan wees wat nog < hi is
            self._range(node.right, lo, hi, result)
    
    # Gee die hoogte van die boom.
    def height(self):
        def h(node):
            return 0 if node is self.NIL else 1 + max(h(node.left), h(node.right))
        return h(self.root)

    # Gee al die (key, value) pare in volgorde van key.
    def items(self):
        # In-order: gesorteer op key
        stack, node = [], self.root
        while stack or node is not self.NIL:
            while node is not self.NIL:
                stack.append(node)
                node = node.left
            node = stack.pop()
            yield node.key, node.value
            node = node.right

    # Kyk of al vier Rooi-Swart reëls (en die BST volgorde) nog geld
    def validate(self):
        assert self.root.color == BLACK, "wortel moet swart wees"

        def check(node, lo, hi):
            if node is self.NIL:
                return 1
            if lo is not None:
                assert node.key > lo, "BST volgorde gebreek"
            if hi is not None:
                assert node.key < hi, "BST volgorde gebreek"
            if node.color == RED:
                assert node.left.color == BLACK and node.right.color == BLACK, "rooi node met rooi kind"
            left = check(node.left, lo, node.key)
            right = check(node.right, node.key, hi)
            assert left == right, "ongelyke aantal swart nodes"
            return left + (1 if node.color == BLACK else 0)

        check(self.root, None, None)

# ==================== BookingCache ====================
# Hou 'n boom per lokaal. 'n Boom word die eerste keer gebou wanneer die lokaal gebruik word.
# Die databasis bly die bron van waarheid, die bome is net 'n geheue-kopie.

# lock is 'n RLock: main.py hou dit vas terwyl dit KYK en INVOEG (sodat twee gebruikers nie
# gelyktydig dieselfde gleuf kan kry nie), en die metodes hieronder vat hom weer (mag herhaal).
class BookingCache:
    # ---------- initialisering ----------
    def __init__(self):
        self._trees = {}  # venue_id -> RBTree
        self.lock = threading.RLock()

    # Laai die boom van die databasis af. Dit word net een keer per lokaal gedoen.
    def _load_from_db(self, venue_id):
        tree = RBTree()

        conn = get_db()
        try:
            rows = conn.execute(
                "SELECT * FROM booking WHERE venue_id = ?", (venue_id,)
            ).fetchall()
        finally:
            conn.close()

        for row in rows:
            booking = Booking(**dict(row))
            for slot in hour_slots(booking.booking_date, booking.start_time, booking.end_time):
                tree.insert((slot, booking.booking_id), booking)

        return tree

    # Gee die boom vir 'n lokaal, laai dit vanaf die databasis as dit nog nie bestaan nie. Veilig om gelyktydig te roep.
    def _tree(self, venue_id):
        with self.lock:
            tree = self._trees.get(venue_id)
            if tree is None:
                tree = self._load_from_db(venue_id)
                self._trees[venue_id] = tree
            return tree

    # Voeg 'n nuwe bespreking by (een node per uur). Veilig om twee keer te roep.
    def add(self, booking):
        with self.lock:
            tree = self._tree(booking.venue_id)
            for slot in hour_slots(booking.booking_date, booking.start_time, booking.end_time):
                tree.insert((slot, booking.booking_id), booking)

    # Gooi die boom vir 'n lokaal weg, dit word herbou vanaf die databasis by volgende gebruik.
    # Gebruik na PUT en DELETE.
    def invalidate(self, venue_id):
        with self.lock:
            self._trees.pop(venue_id, None)

    # Alle besprekings wat 'n uur-gleuf in [start, end) deel, gesorteer op tyd.
    # start en end is datetime objekte. 11:30 as einde word 12:00.
    def find_conflicts(self, venue_id, start, end):
        lo, hi = hour_floor(start), hour_ceiling(end)
        with self.lock:
            hits = self._tree(venue_id).range((lo, 0), (hi, -1))
        return _unique(hits)

    # Alle besprekings van 'n lokaal op een dag
    def bookings_on(self, venue_id, day): 
        lo = datetime.combine(day, time.min)
        hi = lo + timedelta(days=1)
        with self.lock:
            hits = self._tree(venue_id).range((lo, 0), (hi, 0))
        return _unique(hits)

# 'n Bespreking van 3 ure kom 3 keer in die boom voor -> hou net die eerste van elk
def _unique(bookings):
    seen = {}
    for booking in bookings:
        seen.setdefault(booking.booking_id, booking)
    return list(seen.values())
