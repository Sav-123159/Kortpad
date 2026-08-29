from sqlite3 import IntegrityError
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import *
from database import init_db, get_db
from graph import GraphCache
from dijkstra import dijkstra
import bcrypt

app = FastAPI()

origins = [
    'http://localhost:5173'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

init_db()

_map_cache = GraphCache()

@app.get('/')
def root():
    return {'message': 'API'}

# ==================== AUTH ====================
def encrypt_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


# ==================== USER ====================
@app.get('/user/{user_id}')
def get_user(user_id : int):
    if user_id <= 0:
        raise HTTPException(status_code=400, detail='User id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('SELECT * FROM app_user WHERE user_id = ?', (user_id,)).fetchone()
        if not data:
            raise HTTPException(status_code=404, detail='User does not exist')
        
        return User(**dict(data))
    
    finally:
        conn.close()

@app.get('/users')
def get_users():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM app_user').fetchall()
    users = [User(**dict(d)) for d in data]

    conn.close()
    return users

@app.post('/user')
def create_user(user : UserCreate, auth : Auth):
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        #User
        cursor.execute('INSERT INTO app_user (fname, sname, email, is_admin) VALUES (?, ?, ?, 0)',
        (user.fname, user.sname, user.email))

        user_id = cursor.lastrowid

        #Auth
        hashed_password = encrypt_password(auth.password)
        cursor.execute('INSERT INTO auth (user_id, password, email) VALUES (?, ?, ?)',
        (user_id, hashed_password, user.email))
        
        conn.commit()
        return User(user_id=user_id, **user.model_dump())
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Email already exists')
    finally:
        conn.close()

@app.post('/user/admin') #vir admins wat users create, kan hulle initialise met admin rights
def create_user(user : AdminUserCreate, auth : Auth): #gebruik Auth vir password field om die password te protect
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        #User
        cursor.execute('INSERT INTO app_user (fname, sname, email, is_admin) VALUES (?, ?, ?, ?)',
        (user.fname, user.sname, user.email, user.is_admin))

        user_id = cursor.lastrowid

        #Auth
        hashed_password = encrypt_password(auth.password)
        cursor.execute('INSERT INTO auth (user_id, password, email) VALUES (?, ?, ?)',
        (user_id, hashed_password, user.email))
        
        conn.commit()
        return User(user_id=user_id, **user.model_dump()) 
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Email already exists')
    finally:
        conn.close()

@app.post('/user/login') #omdat email unique is
def login(login : Login): #omdat HandleLogin 'n user object verwag moet ek 'n nuwe mode skep
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT password FROM auth WHERE email = ?', (login.email,))
        row = cursor.fetchone()

        if row is None or not verify_password(login.password, row[0]):
            raise HTTPException(status_code=401, detail='Wrong password') 

        data = cursor.execute('SELECT * FROM app_user WHERE email = ?', (login.email,)).fetchone()
        return User(**dict(data)) #stuur frontend toe, vir local storage ook, so gebruik UserCheck
    finally:
        conn.close()

@app.delete('/user/{user_id}')
def delete_user(user_id : int):
    if user_id <= 0:
        raise HTTPException(status_code=400, detail='User id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM app_user WHERE user_id = ?', (user_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='User does not exist')
        
        conn.commit()
        
        return {'message': f'User {user_id} has been deleted'}
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/user/{user_id}')
def update_user(user_id : int, user : UserBase, is_admin : bool): #moet die is_admin by die put function ook kom?
    if user_id <= 0:
        raise HTTPException(status_code=400, detail='User id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('UPDATE app_user SET fname = ?, sname = ?, email = ?, is_admin = ? WHERE user_id = ?',
        (user.fname, user.sname, user.email, is_admin, user_id)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='User does not exist')
        
        conn.commit()
        
        return {'message': f'User {user_id} has been updated'}

    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

# ==================== TIMETABLE ==================== 
@app.get('/timetable/{timetable_id}')
def get_timetable(timetable_id : int):
    if timetable_id <= 0:
        raise HTTPException(status_code=400, detail='Timetable id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('SELECT * FROM timetable WHERE timetable_id = ?', (timetable_id,)).fetchone()
        if not data:
            raise HTTPException(status_code=404, detail='Timetable does not exist')
        
        return Timetable(**dict(data))

    finally:
        conn.close()

@app.get('/timetable/by-venue/{venue_id}')
def get_timetable(venue_id : int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM timetable WHERE venue_id = ?', (venue_id,)).fetchall()
    timetables = [Timetable(**dict(d)) for d in data]

    conn.close()

    return timetables

@app.get('/timetables')
def get_timetables():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM timetable').fetchall()
    timetables = [Timetable(**dict(d)) for d in data]

    conn.close()

    return timetables

@app.post('/timetable') # ****COMEBACK TO THIS FUNCTION FOR REFACTORING MAYBE
def create_timetable(timetable : TimetableCreate):
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute(
            '''INSERT INTO timetable 
                (venue_id, day_of_week, start_time, end_time, module_code, semester_start, semester_end)
                VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (
                timetable.venue_id,
                timetable.day_of_week,
                timetable.start_time.isoformat(),
                timetable.end_time.isoformat(),
                timetable.module_code,
                timetable.semester_start.isoformat(),
                timetable.semester_end.isoformat()
            )
        )
        
        conn.commit()

        return Timetable(timetable_id=cursor.lastrowid, **timetable.model_dump())

    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.delete('/timetable/{timetable_id}')
def delete_timetable(timetable_id : int):
    if timetable_id <= 0:
        raise HTTPException(status_code=400, detail='Timetable id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM timetable WHERE timetable_id = ?', (timetable_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Timetable does not exist')
        
        conn.commit()
        
        return {'message': f'Timetable {timetable_id} has been deleted'}
        
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/timetable/{timetable_id}')
def update_timetable(timetable_id : int, timetable : TimetableBase):
    if timetable_id <= 0:
        raise HTTPException(status_code=400, detail='Timetable id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('UPDATE timetable SET venue_id = ?, day_of_week = ?, start_time = ?, end_time = ?, module_code = ?, semester_start = ?, semester_end = ? WHERE timetable_id = ?',
        (
            timetable.venue_id, 
            timetable.day_of_week, 
            timetable.start_time, 
            timetable.end_time, 
            timetable.module_code, 
            timetable.semester_start, 
            timetable.semester_end, 
            timetable_id
        )
        )

        if cursor.rowcount == 0: #extra check in gesit
            raise HTTPException(status_code=404, detail='Timetable does not exist') 
        
        conn.commit()

        return {'message': f'Timetable {timetable_id} has been updated'}
        
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

# ==================== MODULE ====================
@app.get('/modules')
def get_modules():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM module').fetchall()
    modules = [dict(d) for d in data]

    conn.close()

    return modules

# ==================== BOOKING ====================
@app.get('/booking/{booking_id}')
def get_booking(booking_id : int):
    if booking_id <= 0:
        raise HTTPException(status_code=400, detail='Booking id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('SELECT * FROM booking WHERE booking_id = ?', (booking_id,)).fetchone()
        if not data:
            raise HTTPException(status_code=404, detail='Booking does not exist')
        
        return Booking(**dict(data))
    
    finally:
        conn.close()

@app.get('/booking/by-venue/{venue_id}')
def get_booking(venue_id : int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM booking WHERE venue_id = ?', (venue_id,)).fetchall()
    bookings = [Booking(**dict(d)) for d in data]

    conn.close()

    return bookings

@app.get('/bookings')
def get_bookings():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM booking').fetchall()
    bookings = [Booking(**dict(d)) for d in data]

    conn.close()

    return bookings

@app.post('/booking')
def create_booking(booking : BookingCreate):
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute(
            '''INSERT INTO booking
                (venue_id, user_id, start_time, end_time, booking_date)
                VALUES (?, ?, ?, ?, ?)
                RETURNING booking_id, booking_created_at''',
            (
                booking.venue_id,
                booking.user_id,
                booking.start_time.isoformat(),
                booking.end_time.isoformat(),
                booking.booking_date.isoformat(),
            )
        )
        
        row = cursor.fetchone()
        conn.commit()

        return Booking(booking_id=row[0], booking_created_at=row[1], **booking.model_dump())

    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.delete('/booking/{booking_id}')
def delete_booking(booking_id : int):
    if booking_id <= 0:
        raise HTTPException(status_code=400, detail='Booking id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM booking WHERE booking_id = ?', (booking_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Booking does not exist')
        
        conn.commit()
    
        return {'message': f'Booking {booking_id} has been deleted'}
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/booking/{booking_id}')
def update_booking(booking_id : int, booking : BookingBase):
    if booking_id <= 0:
        raise HTTPException(status_code=400, detail='Booking id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('UPDATE booking SET venue_id = ?, user_id = ?, start_time = ?, end_time = ?, booking_date = ?, booking_created_at = ? WHERE booking_id = ?',
        (
            booking.venue_id, 
            booking.user_id, 
            booking.start_time, 
            booking.end_time, 
            booking.booking_date, 
            booking.booking_created_at, 
            booking_id
        )
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Booking does not exist')
        
        conn.commit()
        
        return {'message': f'Booking {booking_id} has been updated'}

    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

# ==================== CAMPUS ====================
@app.get('/campus/{campus_id}')
def get_campus(campus_id : int):
    if campus_id <= 0:
        raise HTTPException(status_code=400, detail='Campus id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('SELECT * FROM campus WHERE campus_id = ?', (campus_id,)).fetchone()
        if not data:
            raise HTTPException(status_code=404, detail='Campus does not exist')

        return Campus(**dict(data))
    
    finally:
        conn.close()

@app.get('/campuses')
def get_campuses():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM campus').fetchall()
    campuses = [Campus(**dict(d)) for d in data]

    conn.close()

    return campuses

@app.post('/campus')
def create_campus(campus : CampusCreate):
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('INSERT INTO campus (campus_name) VALUES (?)',
        (campus.campus_name,))
        
        conn.commit()
        
        return Campus(campus_id=cursor.lastrowid, **campus.model_dump())
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Campus needs a campus name')
    finally:
        conn.close()

@app.delete('/campus/{campus_id}')
def delete_campus(campus_id : int):
    if campus_id <= 0:
        raise HTTPException(status_code=400, detail='Campus id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM campus WHERE campus_id = ?', (campus_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Campus does not exist')
        
        conn.commit()
        
        return {'message': f'Campus {campus_id} has been deleted'}
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/campus/{campus_id}')
def update_campus(campus_id : int, campus : CampusBase):
    if campus_id <= 0:
        raise HTTPException(status_code=400, detail='Campus id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('UPDATE campus SET campus_name = ? WHERE campus_id = ?',
        (campus.campus_name, campus_id)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Campus does not exist')
        
        conn.commit()

        return {'message': f'Campus {campus_id} has been updated'}
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()
        
# ==================== CAMPUS MAP ====================
@app.get('/campus-map/{campus_id}')
def get_campus_map(campus_id : int):
    if campus_id <= 0:
        raise HTTPException(status_code=400, detail='Campus id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('SELECT * FROM campus_map WHERE campus_id = ?', (campus_id,)).fetchone()
        if not data:
            raise HTTPException(status_code=404, detail='campus map does not exist')
        
        return CampusMap(**dict(data))

    finally:
        conn.close()
    
# ==================== BUILDING ====================
@app.get('/buildings/by-campus/{campus_id}') #daar was 2 get('/buildings/by-campus/{campus_id}')'s, altwee was presies dieselfde, een is delete
def get_buildings(campus_id : int):
    conn = get_db()
    
    cursor = conn.cursor()
    
    data = cursor.execute('SELECT * FROM building WHERE campus_id = ?', (campus_id,)).fetchall()
    buildings = [Building(**dict(d)) for d in data] 
    
    conn.close()
    
    return buildings

@app.get('/building/{building_id}')
def get_building(building_id : int):
    if building_id <= 0:
        raise HTTPException(status_code=400, detail='Building id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('SELECT * FROM building WHERE building_id = ?', (building_id,)).fetchone() #campus_id na building_id to verander
        if not data:
            raise HTTPException(status_code=404, detail='Building does not exist')
        
        return Building(**dict(data))
    
    finally:
        conn.close()

@app.get('/buildings')
def get_buildings():
    conn = get_db()
    cursor = conn.cursor()
    
    data = cursor.execute('SELECT * FROM building').fetchall()
    buildings = [Building(**dict(d)) for d in data]

    conn.close()

    return buildings

@app.post('/building')
def create_building(building : BuildingCreate):
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('INSERT INTO building (campus_id, building_name) VALUES (?, ?)',
        (building.campus_id, building.building_name))
        
        conn.commit()
        
        return Building(building_id=cursor.lastrowid, **building.model_dump())

    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.delete('/building/{building_id}')
def delete_building(building_id : int):
    if building_id <= 0:
        raise HTTPException(status_code=400, detail='Building id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM building WHERE building_id = ?', (building_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Building does not exist')
        
        conn.commit()
        
        return {'message': f'Building {building_id} has been deleted'}
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/building/{building_id}')
def update_building(building_id : int, building : BuildingBase):
    if building_id <= 0:
        raise HTTPException(status_code=400, detail='Building id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('UPDATE building SET campus_id = ?, building_name = ? WHERE building_id = ?',
        (building.campus_id, building.building_name, building_id)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Building does not exist')
        
        conn.commit()

        return {'message': f'Building {building_id} has been updated'}
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

# ==================== VENUE ====================
@app.get('/venue/{venue_id}')
def get_venue(venue_id : int):
    if venue_id <= 0:
        raise HTTPException(status_code=400, detail='Venue id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('SELECT * FROM venue WHERE venue_id = ?', (venue_id,)).fetchone()
        if not data:
            raise HTTPException(status_code=404, detail='Venue does not exist')
        
        return Venue(**dict(data))

    finally:
        conn.close()

@app.get('/venue/by-campus/{campus_id}')
def get_venue(campus_id : int):
    _map_cache.get_graph(campus_id)
    
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('''
        SELECT venue.* 
        FROM venue 
        JOIN building 
        ON venue.building_id = building.building_id  
        WHERE campus_id = ?''', (campus_id,)).fetchall()
    venues = [Venue(**dict(d)) for d in data]
    
    conn.close()
    
    return venues

@app.get('/venues')
def get_all_venues():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM venue').fetchall()
    venues = [Venue(**dict(d)) for d in data]

    conn.close()

    return venues

@app.post('/venue')
def create_venue(venue : VenueCreate):
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('INSERT INTO venue (building_id, venue_name, capacity) VALUES (?, ?, ?)',
        (venue.building_id, venue.venue_name, venue.capacity))
        
        conn.commit()
        
        return Venue(venue_id=cursor.lastrowid, **venue.model_dump())
        
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.delete('/venue/{venue_id}')
def delete_venue(venue_id : int):
    if venue_id <= 0:
        raise HTTPException(status_code=400, detail='Venue id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM venue WHERE venue_id = ?', (venue_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Venue does not exist')
        
        conn.commit()
        
        return {'message': f'Venue {venue_id} has been deleted'}

    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/venue/{venue_id}')
def update_venue(venue_id : int, venue : VenueBase):
    if venue_id <= 0:
        raise HTTPException(status_code=400, detail='Venue id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('UPDATE venue SET building_id = ?, venue_name = ?, capacity = ? WHERE venue_id = ?',
        (venue.building_id, venue.venue_name, venue.capacity, venue_id)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Venue does not exist')
        
        conn.commit()
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.get('/venues/by-building/{building_id}')
def get_venues_by_building(building_id: int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute(
        'SELECT * FROM venue WHERE building_id = ?',
        (building_id,)
    ).fetchall()

    venues = [Venue(**dict(d)) for d in data]

    conn.close()

    return venues

# ==================== EQUIPMENT ====================
@app.get('/equipment/by-venue_id/{venue_id}')
def get_equipment_by_venue(venue_id: int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute(
        'SELECT * FROM equipment WHERE venue_id = ?',
        (venue_id,)
    ).fetchall()

    equipment = [dict(d) for d in data]

    conn.close()

    return equipment

@app.post('/equipment')
def create_equipment(equipment: EquipmentCreate):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO equipment (venue_id, equip_name, equip_qty) VALUES (?, ?, ?)',
            (equipment.venue_id, equipment.equip_name, equipment.equip_qty)
        )
        conn.commit()
        return dict(equip_id=cursor.lastrowid, **equipment.model_dump())
    except IntegrityError:
        raise HTTPException(status_code=400, detail='Something went wrong while adding equipment')
    finally:
        conn.close()

@app.delete('/equipment/{equip_id}')
def delete_equipment(equip_id: int):
    if equip_id <= 0:
        raise HTTPException(status_code=400, detail='Equipment id must be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM equipment WHERE equip_id = ?', (equip_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Equipment does not exist')
        
        conn.commit()
        return {'message': f'Equipment {equip_id} has been deleted'}
    except IntegrityError:
        raise HTTPException(status_code=400, detail='Something went wrong while deleting equipment')
    finally:
        conn.close()

@app.put('/equipment/{equip_id}')
def update_equipment(equip_id: int, equipment: EquipmentBase):
    if equip_id <= 0:
        raise HTTPException(status_code=400, detail='Equipment id must be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE equipment SET venue_id = ?, equip_name = ?, equip_qty = ? WHERE equip_id = ?',
            (equipment.venue_id, equipment.equip_name, equipment.equip_qty, equip_id)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Equipment does not exist')
        
        conn.commit()
        return {'message': f'Equipment {equip_id} has been updated'}
    except IntegrityError:
        raise HTTPException(status_code=400, detail='Something went wrong while updating equipment')
    finally:
        conn.close()
# ==================== MAP ====================
@app.get('/route/{campus_id}-{start_venue}-{destination_venue}')
def get_route(campus_id : int, start_venue : int, destination_venue : int):
    if campus_id <= 0:
        raise HTTPException(status_code=400, detail='Campus id needs to be greater than 0')

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT ven.venue_id, v.vertex_id
        FROM venue ven
        JOIN vertex v ON v.venue_id = ven.venue_id AND v.level = 'building'
        WHERE ven.venue_id IN (?, ?)
    ''', (start_venue, destination_venue))

    rows = {row['venue_id']: row['vertex_id'] for row in cursor.fetchall()}
    conn.close()

    if start_venue not in rows or destination_venue not in rows:
        raise HTTPException(status_code=404, detail='One or both venues could not be resolved to a location')

    start_from = rows[start_venue]
    destination = rows[destination_venue]
    
    try:
        adjacency, vertices = _map_cache.get_graph(campus_id)
        path_data, distance_data = dijkstra(adjacency, vertices, start_from, destination)
        
        coordinates = [
            [vertices[vertex_id]['latitude'], vertices[vertex_id]['longitude']]
            for vertex_id in path_data
        ]
        
        return Route(path_coordinates=coordinates, distance=distance_data)
    
    except Exception:
        raise HTTPException(status_code=400, detail='Route could not be determined')
