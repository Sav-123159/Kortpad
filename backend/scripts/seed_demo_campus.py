"""
Genereer 'n groot, digter-gekoppelde demo-kampus vir die MST- en Edmonds-Karp-aanbiedings.

Waarom 'n rooster (grid) en nie 'n ewekansige verspreiding nie:
- 'n Rooster met buur-tot-buur rande gee outomaties VEELVULDIGE paaie tussen enige twee
  punte (nodig vir 'n interessante max-flow demo -- 'n boom-vormige kampus soos Leriba het
  net EEN pad tussen enige twee punte, wat max-flow glad nie interessant maak nie).
- MST trek nie van hierdie tabel se rande af nie (prim.py bou sy eie volledige grafiek
  direk vanaf die hoekpunte se koördinate) -- dus help die rooster MST net deur genoeg
  hoekpunte te gee sodat die "voor-en-na"-verskil duidelik sigbaar is.
"""

import math
import random
from PIL import Image, ImageDraw

# ==================== PARAMETERS ====================
CAMPUS_ID = 3                     # moet 'n campus_id wees wat nog nie in jou DB bestaan nie
CAMPUS_NAME = "Nuwe Kampus (Demo)"

ROWS = 36
COLS = 36                        # 14 x 14 = 196 hoekpunte -- binne die 100-200 doelwit

SPACING = 120                     # pixels tussen aangrensende roosterpunte
MARGIN = 80                       # pixels se oop ruimte om die hele rooster

DIAGONALS = True                  # voeg diagonale rande by vir 'n digter, meer "mesh"-agtige grafiek

WEIGHT_JITTER = 6                 # klein ewekansige variasie op afstand, sodat nie elke
                                   # horisontale/vertikale rand presies dieselfde gewig het nie
CAPACITY_MIN = 5
CAPACITY_MAX = 50

RANDOM_SEED = 42                  # VAS -- moet dieselfde bly tussen laai, vir herhaalbare demo's

OUTPUT_SQL_PATH = "/home/Coenrad/Coding/ngpro262_projek/data/demo_campus_seed.sql"
OUTPUT_IMAGE_PATH = "/home/Coenrad/Coding/ngpro262_projek/frontend/public/maps/demo_campus_map.jpg"
IMAGE_WEB_PATH = "/demo_campus_map.jpg"   # pad soos dit in campus_map.image_path gestoor word

random.seed(RANDOM_SEED)

# ==================== HOEKPUNTE GENEREER ====================
# vertices[(row, col)] = (lat, lon) -- lat = y-as (hoogte), lon = x-as (breedte),
# dieselfde konvensie as die res van die projek (sien pixelNaKampus in AdminNodusKaart.jsx)
vertices = {}
for r in range(ROWS):
    for c in range(COLS):
        lon = MARGIN + c * SPACING
        lat = MARGIN + r * SPACING
        vertices[(r, c)] = (lat, lon)

image_width = MARGIN * 2 + (COLS - 1) * SPACING
image_height = MARGIN * 2 + (ROWS - 1) * SPACING


def distance(a, b):
    return math.dist(a, b)


# ==================== RANDE GENEREER ====================
# Elke rand word net EEN keer gestoor, van die roosterpunt met die kleiner (row, col) na
# die groter -- buur-tot-buur (regs, onder) plus opsioneel diagonale (zig-zag patroon,
# om dubbel-diagonale wat deur dieselfde vierkant sny te vermy).
edges = []  # (vertex_a_pos, vertex_b_pos, weight, capacity)

for r in range(ROWS):
    for c in range(COLS):
        here = (r, c)

        neighbors = []
        if c + 1 < COLS:
            neighbors.append((r, c + 1))          # regs
        if r + 1 < ROWS:
            neighbors.append((r + 1, c))          # onder
        if DIAGONALS and r + 1 < ROWS and c + 1 < COLS:
            neighbors.append((r + 1, c + 1))      # regs-onder
        if DIAGONALS and r + 1 < ROWS and c - 1 >= 0 and (r + c) % 2 == 0:
            neighbors.append((r + 1, c - 1))      # links-onder, net om die ander ruit af te wissel

        for other in neighbors:
            a, b = vertices[here], vertices[other]
            w = round(distance(a, b) + random.uniform(-WEIGHT_JITTER, WEIGHT_JITTER), 1)
            w = max(w, 1.0)
            cap = random.randint(CAPACITY_MIN, CAPACITY_MAX)
            edges.append((here, other, w, cap))

print(f"Gegenereer: {len(vertices)} hoekpunte, {len(edges)} rande")

# ==================== PLACEHOLDER-BEELD ====================
# 'n Eenvoudige ligte agtergrond met roosterlyne -- net om visueel te orienteer in die demo,
# nie 'n regte kaart nie. Afmetings stem EKSAK ooreen met die koördinaatstelsel hierbo,
# sodat bounds_lat/bounds_lon presies by die hoekpunte se latitude/longitude pas.
img = Image.new("RGB", (image_width, image_height), (227, 238, 212))  # --paper
draw = ImageDraw.Draw(img)

for c in range(COLS):
    x = MARGIN + c * SPACING
    draw.line([(x, 0), (x, image_height)], fill=(174, 195, 176), width=1)  # --paper-deep
for r in range(ROWS):
    y = MARGIN + r * SPACING
    draw.line([(0, y), (image_width, y)], fill=(174, 195, 176), width=1)

img.save(OUTPUT_IMAGE_PATH, quality=90)
print(f"Beeld gestoor: {OUTPUT_IMAGE_PATH} ({image_width}x{image_height})")

# ==================== SQL GENEREER ====================
lines = []
lines.append("-- Gegenereer deur generate_demo_campus.py -- MOENIE hierdie lêer met die hand wysig nie.")
lines.append(f"-- RANDOM_SEED={RANDOM_SEED}, ROWS={ROWS}, COLS={COLS} -- loop die skrip weer vir nuwe/ander data.")
lines.append("")
lines.append(f"INSERT INTO campus (campus_id, campus_name) VALUES ({CAMPUS_ID}, '{CAMPUS_NAME}');")
lines.append("")
lines.append("INSERT INTO campus_map (campus_id, image_path, bounds_lat, bounds_lon) VALUES")
lines.append(f"  ({CAMPUS_ID}, '{IMAGE_WEB_PATH}', {image_height}, {image_width});")
lines.append("")

lines.append("-- VERTICES")
lines.append("INSERT INTO vertex (level, campus_id, building_id, venue_id, floor, latitude, longitude) VALUES")
vertex_value_lines = []
for (r, c), (lat, lon) in vertices.items():
    vertex_value_lines.append(f"    ('campus', {CAMPUS_ID}, NULL, NULL, NULL, {lat:.2f}, {lon:.2f})")
lines.append(",\n".join(vertex_value_lines) + ";")
lines.append("")

lines.append("-- EDGES (koördinaat-ooreenstemming, veilig ongeag werklike autoincrement-id's)")
for (ar, ac), (br, bc), w, cap in edges:
    alat, alon = vertices[(ar, ac)]
    blat, blon = vertices[(br, bc)]
    lines.append("INSERT INTO edge (vertex_a, vertex_b, weight, capacity)")
    lines.append(f"SELECT MIN(x.vertex_id, y.vertex_id), MAX(x.vertex_id, y.vertex_id), {w}, {cap}")
    lines.append("FROM vertex x, vertex y")
    lines.append(f"WHERE x.campus_id = {CAMPUS_ID} AND x.latitude = {alat:.2f} AND x.longitude = {alon:.2f}")
    lines.append(f"  AND y.campus_id = {CAMPUS_ID} AND y.latitude = {blat:.2f} AND y.longitude = {blon:.2f};")
    lines.append("")

with open(OUTPUT_SQL_PATH, "w") as f:
    f.write("\n".join(lines))

print(f"SQL gestoor: {OUTPUT_SQL_PATH}")
