from sqlite3 import IntegrityError
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import *
from database import init_db, get_db
from datetime import date, time

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

@app.get('/')
def root():
    return {'message': 'API'}

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
def create_user(user : UserCreate):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO app_user (fname, sname, email) VALUES (?, ?, ?)',
        (user.fname, user.sname, user.email))
        
        conn.commit()

        return User(user_id=cursor.lastrowid, **user.model_dump())
    
    except IntegrityError:
        raise HTTPException(status_code=400, detail='Email already exists')
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
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/user/{user_id}')
def update_user(user_id : int, user : UserBase):
    if user_id <= 0:
        raise HTTPException(status_code=400, detail='User id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('UPDATE app_user SET fname = ?, sname = ?, email = ? WHERE user_id = ?',
        (user.fname, user.sname, user.email, user_id)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='User does not exist')
        
        conn.commit()
        
        return {'message': f'User {user_id} has been updated'}

    except IntegrityError:
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

# ==================== TIMETABLE ==================== 
@app.get('/timetable/{id}')
def get_timetable(id : int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM timetable WHERE timetable_id = ?', (id,)).fetchone()
    timetable = Timetable(**dict(data)) if data else None

    conn.close()

    return timetable

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

@app.post('/timetable')
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
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.delete('/timetable/{id}')
def delete_timetable(id : int):
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM timetable WHERE timetable_id = ?', (id,))
        conn.commit()
        
        return {'message': 'Timetable has been deleted'}
        
    except IntegrityError:
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/timetable/{id}')
def update_timetable(id : int, venue_id : int, day_of_week : str, start_time : str, end_time : str, module_code : str, semester_start : str, semester_end : str):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('UPDATE timetable SET venue_id = ?, day_of_week = ?, start_time = ?, end_time = ?, module_code = ?, semester_start = ?, semester_end = ? WHERE timetable_id = ?',
    (venue_id, day_of_week, start_time, end_time, module_code, semester_start, semester_end, id)
    )
    conn.commit()

    data = cursor.execute('SELECT * FROM timetable WHERE timetable_id = ?', (id,)).fetchone()
    timetable = Timetable(**dict(data)) if data else None

    conn.close()

    return timetable

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
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.delete('/booking/{id}')
def delete_booking(id : int):
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM booking WHERE booking_id = ?', (id,))
        conn.commit()
    
        return {'message': 'Booking has been deleted'}
    
    except IntegrityError:
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/booking/{id}')
def update_booking(id : int, venue_id : int, user_id : int, start_time : str, end_time : str, booking_date : str, booking_created_at : str):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('UPDATE booking SET venue_id = ?, user_id = ?, start_time = ?, end_time = ?, booking_date = ?, booking_created_at = ? WHERE booking_id = ?',
    (venue_id, user_id, start_time, end_time, booking_date, booking_created_at, id)
    )
    conn.commit()

    data = cursor.execute('SELECT * FROM booking WHERE booking_id = ?', (id,)).fetchone()
    booking = Booking(**dict(data)) if data else None

    conn.close()

    return booking

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
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

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

@app.post('/building')
def create_building(building : BuildingCreate):
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('INSERT INTO building (campus_id, building_name, faculty_id) VALUES (?, ?, ?)',
        (building.campus_id, building.building_name, building.faculty_id))
        
        conn.commit()
        
        return Building(building_id=cursor.lastrowid, **building.model_dump())

    except IntegrityError:
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.delete('/building/{id}')
def delete_building(id : int):
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM building WHERE building_id = ?', (id,))
        conn.commit()
        
        return {'message': 'Building has been deleted'}
    
    except IntegrityError:
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/building/{id}')
def update_building(id : int, campus_id : int, building_name : str, faculty_id : int):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('UPDATE building SET campus_id = ?, building_name = ?, faculty_id = ? WHERE building_id = ?',
    (campus_id, building_name, faculty_id, id)
    )
    conn.commit()

    data = cursor.execute('SELECT * FROM building WHERE building_id = ?', (id,)).fetchone()
    building = Building(**dict(data)) if data else None

    conn.close()

    return building

# ==================== VENUE ====================
@app.get('/venue/{id}')
def get_venue(id : int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM venue WHERE venue_id = ?', (id,)).fetchone()
    venue = Venue(**dict(data)) if data else None

    conn.close()

    return venue

@app.get('/venue/by-campus/{campus_id}')
def get_venue(campus_id : int):
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
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.delete('/venue/{id}')
def delete_venue(id : int):
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM venue WHERE venue_id = ?', (id,))
        conn.commit()
        
        return {'message': 'Venue has been deleted'}

    except IntegrityError:
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/venue/{id}')
def update_venue(id : int, building_id : int, venue_name : str, capacity : int):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('UPDATE venue SET building_id = ?, venue_name = ?, capacity = ? WHERE venue_id = ?',
    (building_id, venue_name, capacity, id)
    )
    conn.commit()

    data = cursor.execute('SELECT * FROM venue WHERE venue_id = ?', (id,)).fetchone()
    venue = Venue(**dict(data)) if data else None

    conn.close()

    return venue
