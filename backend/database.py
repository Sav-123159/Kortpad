import os
import sqlite3
from pathlib import Path

BACKEND_DIR = Path(__file__).parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = PROJECT_ROOT / 'data'

DATA_DIR.mkdir(exist_ok=True)

DATABASE_PATH = os.getenv('DATABASE_PATH',str(DATA_DIR / 'database.db'))

def get_db():
    db_conn = sqlite3.connect(DATABASE_PATH)
    db_conn.row_factory = sqlite3.Row
    return db_conn

def create_tables():
    db_conn = get_db()
    cursor = db_conn.cursor()
    
    # CAMPUS Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS campus (
            campus_id INTEGER PRIMARY KEY AUTOINCREMENT,
            campus_name VARCHAR(100) NOT NULL
        );     
    ''')
    
    # CAMPUS_MAP Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS campus_map (
            campus_id INTEGER PRIMARY KEY,
            image_path TEXT NOT NULL,
            bounds_lat DECIMAL(9,2) NOT NULL,
            bounds_lon DECIMAL(9,2) NOT NULL,
            FOREIGN KEY (campus_id) REFERENCES campus(campus_id)
        );                
    ''')
    
    # BUILDING Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS building (
            building_id INTEGER PRIMARY KEY AUTOINCREMENT,
            campus_id INTEGER NOT NULL,
            building_name VARCHAR(100) NOT NULL,
            FOREIGN KEY (campus_id) REFERENCES campus(campus_id)
        );
    ''')
    
    # BUILDING_MAP Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS building_map (
            building_id INTEGER NOT NULL,
            image_path TEXT NOT NULL,
            floor INTEGER NOT NULL,
            bounds_lat DECIMAL(9,2) NOT NULL,
            bounds_lon DECIMAL(9,2) NOT NULL,
            PRIMARY KEY (building_id, floor),
            FOREIGN KEY (building_id) REFERENCES building(building_id)
        );                
    ''')
    
    # VERTEX Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vertex (
            vertex_id INTEGER PRIMARY KEY AUTOINCREMENT,
            level TEXT NOT NULL CHECK (level IN ('campus', 'building')),
            campus_id INTEGER,
            building_id INTEGER,
            venue_id INTEGER,
            floor INTEGER,
            latitude DECIMAL(9,6) NOT NULL,
            longitude DECIMAL(9,6) NOT NULL,
            FOREIGN KEY (campus_id) REFERENCES campus(campus_id),
            FOREIGN KEY (building_id) REFERENCES building(building_id),
            FOREIGN KEY (venue_id) REFERENCES venue(venue_id),
            CHECK (
                (level = 'campus' AND campus_id IS NOT NULL AND venue_id IS NULL AND floor IS NULL)
                OR (level = 'building' AND building_id IS NOT NULL AND floor IS NOT NULL)
            )
        );    
    ''')
    
    # EDGE Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS edge (
            edge_id INTEGER PRIMARY KEY AUTOINCREMENT,
            vertex_a INTEGER NOT NULL,
            vertex_b INTEGER NOT NULL,
            weight DECIMAL(8,2) NOT NULL,
            FOREIGN KEY (vertex_a) REFERENCES vertex(vertex_id),
            FOREIGN KEY (vertex_b) REFERENCES vertex(vertex_id),
            CHECK (vertex_a < vertex_b),
            UNIQUE (vertex_a, vertex_b)
        );         
    ''')
    
    # VENUE Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS venue (
            venue_id INTEGER PRIMARY KEY AUTOINCREMENT,
            building_id INTEGER NOT NULL,
            venue_name VARCHAR(100) NOT NULL,
            capacity INT,
            floor INTEGER NOT NULL,
            FOREIGN KEY (building_id) REFERENCES building(building_id)
        );            
    ''')
    
    # EQUIPMENT Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS equipment (
            equip_id INTEGER PRIMARY KEY AUTOINCREMENT,
            venue_id INTEGER,
            equip_name VARCHAR(100) NOT NULL,
            equip_qty INTEGER DEFAULT 0,
            FOREIGN KEY (venue_id) REFERENCES venue(venue_id)
        );                
    ''')
    
    # TIMETABLE Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS timetable (
            timetable_id INTEGER PRIMARY KEY AUTOINCREMENT,
            venue_id INTEGER NOT NULL,
            day_of_week TEXT NOT NULL CHECK (day_of_week IN ('MON','TUE','WED','THU','FRI','SAT','SUN')),
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            module_code TEXT,
            semester_start DATE NOT NULL,
            semester_end DATE NOT NULL,
            FOREIGN KEY (venue_id) REFERENCES venue(venue_id),
            CHECK (end_time > start_time)
        )        
    ''')
    
    # MODULE Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS module (
            module_id INTEGER PRIMARY KEY AUTOINCREMENT,
            module_name VARCHAR(100) NOT NULL
        );     
    ''')
    
    # APP_USER Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS app_user (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            fname VARCHAR(50) NOT NULL,
            sname VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            is_admin BOOLEAN NOT NULL CHECK (is_admin IN (0, 1)) DEFAULT 0
        );               
    ''')
    
    # AUTH Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS auth (
            user_id  INTEGER PRIMARY KEY,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(100),
            FOREIGN KEY (user_id) REFERENCES app_user(user_id),
            FOREIGN KEY (email) REFERENCES app_user(email)
        );               
    ''')
    
    # BOOKING Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS booking (
            booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
            venue_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            booking_date DATE NOT NULL,
            booking_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (venue_id) REFERENCES venue(venue_id),
            FOREIGN KEY (user_id) REFERENCES app_user(user_id)
        );
    ''')

    db_conn.commit()
    db_conn.close()

def create_views():
    db_conn = get_db()
    cursor = db_conn.cursor()

    cursor.execute('DROP VIEW IF EXISTS edge_adjacency;')
    # EDGE_ADJACENCY View
    cursor.execute('''
        CREATE VIEW edge_adjacency AS
        SELECT vertex_a AS from_vertex, vertex_b AS to_vertex, weight FROM edge
        UNION ALL
        SELECT vertex_b AS from_vertex, vertex_a AS to_vertex, weight FROM edge;
    ''')

    cursor.execute('DROP VIEW IF EXISTS venue_schedule;')
    # VENUE_SCHEDULE View
    cursor.execute('''
        CREATE VIEW venue_schedule AS
        SELECT
            v.venue_id,
            v.venue_name,
            'CLASS' AS entry_type,
            t.day_of_week,
            NULL AS specific_date,
            t.semester_start,
            t.semester_end,
            t.start_time,
            t.end_time
        FROM timetable t
        JOIN venue v ON v.venue_id = t.venue_id

        UNION ALL

        SELECT
            v.venue_id,
            v.venue_name,
            'BOOKING' AS entry_type,
            NULL AS day_of_week,
            b.booking_date AS specific_date,
            NULL AS semester_start,
            NULL AS semester_end,
            b.start_time,
            b.end_time
        FROM booking b
        JOIN venue v ON v.venue_id = b.venue_id
        JOIN app_user u ON u.user_id = b.user_id;
    ''')

    db_conn.commit()
    db_conn.close()

def init_db():
    create_tables()
    create_views()

