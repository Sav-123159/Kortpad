from fastapi import FastAPI
from models import *
from database import init_db, get_db

app = FastAPI()

init_db()

@app.get('/')
def root():
    return {'message': 'API'}

# ==================== USER ====================
@app.get('/user/{id}')
def get_user(id : int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM app_user WHERE user_id = ?', (id,)).fetchone()
    user = User(**dict(data)) if data else None

    conn.close()

    return user

@app.get('/users')
def get_users():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM app_user').fetchall()
    users = [User(**dict(d)) for d in data]

    conn.close()

    return users

# ==================== TIMETABLE ==================== 
@app.get('/timetable/{id}')
def get_timetable(id : int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM timetable WHERE timetable_id = ?', (id,)).fetchone()
    timetable = Timetable(**dict(data)) if data else None

    conn.close()

    return timetable

@app.get('/timetables')
def get_timetables():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM timetable').fetchall()
    timetables = [Timetable(**dict(d)) for d in data]

    conn.close()

    return timetables

# ==================== BOOKING ====================
@app.get('/booking/{id}')
def get_booking(id : int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM booking WHERE booking_id = ?', (id,)).fetchone()
    booking = Booking(**dict(data)) if data else None

    conn.close()

    return booking

@app.get('/bookings')
def get_bookings():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM booking').fetchall()
    bookings = [Booking(**dict(d)) for d in data]

    conn.close()

    return bookings

# ==================== CAMPUS ====================
@app.get('/campus/{id}')
def get_campus(id : int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM campus WHERE campus_id = ?', (id,)).fetchone()
    campus = Campus(**dict(data)) if data else None

    conn.close()

    return campus

@app.get('/campuses')
def get_campuses():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM campus').fetchall()
    campuses = [Campus(**dict(d)) for d in data]

    conn.close()

    return campuses

# ==================== BUILDING ====================
@app.get('/building/{id}')
def get_building(id : int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM building WHERE campus_id = ?', (id,)).fetchone()
    building = Building(**dict(data)) if data else None

    conn.close()

    return building

@app.get('/buildings')
def get_buildings():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM building').fetchall()
    buildings = [Building(**dict(d)) for d in data]

    conn.close()

    return buildings

# ==================== VENUE ====================
@app.get('/venue/{id}')
def get_venue(id : int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM venue WHERE venue_id = ?', (id,)).fetchone()
    venue = Venue(**dict(data)) if data else None

    conn.close()

    return venue

@app.get('/venues')
def get_all_venues():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM venue').fetchall()
    venues = [Venue(**dict(d)) for d in data]

    conn.close()

    return venues
