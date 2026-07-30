import sqlite3

DATABASE_NAME = "./data/database.db"

def get_db():
    db_conn = sqlite3.connect(DATABASE_NAME)
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
    
    # FACULTY Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS faculty (
            faculty_id INTEGER PRIMARY KEY AUTOINCREMENT,
            faculty_name VARCHAR(100) NOT NULL
        );            
    ''')
    
    # BUILDING Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS building (
            building_id INTEGER PRIMARY KEY AUTOINCREMENT,
            campus_id INTEGER NOT NULL,
            building_name VARCHAR(100) NOT NULL,
            faculty_id INTEGER NOT NULL,
            FOREIGN KEY (campus_id) REFERENCES campus(campus_id),
            FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
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
            latitude DECIMAL(9,6) NOT NULL,
            longitude DECIMAL(9,6) NOT NULL,
            FOREIGN KEY (campus_id) REFERENCES campus(campus_id),
            FOREIGN KEY (building_id) REFERENCES building(building_id),
            FOREIGN KEY (venue_id) REFERENCES venue(venue_id),
            CHECK (
                (level = 'campus'   AND campus_id IS NOT NULL AND venue_id IS NULL)
                OR (level = 'building' AND building_id IS NOT NULL)
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
            FOREIGN KEY (building_id) REFERENCES building(building_id)
        );            
    ''')
    
    # EQUIPMENT Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS equipment (
            equip_id INTEGER PRIMARY KEY AUTOINCREMENT,
            venue_id INTEGER,
            equip_name VARCHAR(100) NOT NULL,
            equip_qty INT DEFAULT 0,
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
    
    # APP_USER Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS app_user (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            fname VARCHAR(50) NOT NULL,
            sname VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE
        );               
    ''')
    
    # AUTH Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS auth (
            user_id  INTEGER PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
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
            t.term_start,
            t.term_end,
            t.start_time,
            t.end_time,
            t.module_code AS description
        FROM timetable t
        JOIN venue v ON v.venue_id = t.venue_id

        UNION ALL

        SELECT
            v.venue_id,
            v.venue_name,
            'BOOKING' AS entry_type,
            NULL AS day_of_week,
            b.booking_date AS specific_date,
            NULL AS term_start,
            NULL AS term_end,
            b.start_time,
            b.end_time,
            'Boeking deur ' || u.fname || ' ' || u.sname AS description
        FROM booking b
        JOIN venue v ON v.venue_id = b.venue_id
        JOIN app_user u ON u.user_id = b.user_id;
    ''')

    db_conn.commit()
    db_conn.close()

def init_db():
    create_tables()
    create_views()

def insert_test_data():
    """Minimal test data covering every table and FK relationship."""
    db_conn = get_db()
    cursor = db_conn.cursor()

    # CAMPUS
    cursor.execute("INSERT INTO campus (campus_name) VALUES (?)", ("Main Campus",))
    campus_id = cursor.lastrowid

    # FACULTY
    cursor.execute("INSERT INTO faculty (faculty_name) VALUES (?)", ("Faculty of Science",))
    faculty_id = cursor.lastrowid

    # BUILDING
    cursor.execute(
        "INSERT INTO building (campus_id, building_name, faculty_id) VALUES (?, ?, ?)",
        (campus_id, "Building A", faculty_id),
    )
    building_id = cursor.lastrowid

    # VENUE (two rows so we have something to book/equip/timetable, and to link to a vertex)
    cursor.execute(
        "INSERT INTO venue (building_id, venue_name, capacity) VALUES (?, ?, ?)",
        (building_id, "Room 101", 30),
    )
    venue_id = cursor.lastrowid

    # VERTEX (one at campus level, one at building level -> gives us 2 nodes for an edge)
    cursor.execute(
        "INSERT INTO vertex (level, campus_id, building_id, venue_id, latitude, longitude) "
        "VALUES ('campus', ?, NULL, NULL, ?, ?)",
        (campus_id, -26.190430, 28.026070),
    )
    vertex_campus_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO vertex (level, campus_id, building_id, venue_id, latitude, longitude) "
        "VALUES ('building', NULL, ?, ?, ?, ?)",
        (building_id, venue_id, -26.190500, 28.026200),
    )
    vertex_building_id = cursor.lastrowid

    # EDGE (vertex_a must be < vertex_b)
    vertex_a, vertex_b = sorted((vertex_campus_id, vertex_building_id))
    cursor.execute(
        "INSERT INTO edge (vertex_a, vertex_b, weight) VALUES (?, ?, ?)",
        (vertex_a, vertex_b, 120.50),
    )

    # EQUIPMENT
    cursor.execute(
        "INSERT INTO equipment (venue_id, equip_name, equip_qty) VALUES (?, ?, ?)",
        (venue_id, "Projector", 2),
    )

    # TIMETABLE
    cursor.execute(
        "INSERT INTO timetable (venue_id, day_of_week, start_time, end_time, module_code, "
        "semester_start, semester_end) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (venue_id, "MON", "09:00", "10:00", "CS101", "2026-07-27", "2026-11-13"),
    )

    # APP_USER
    cursor.execute(
        "INSERT INTO app_user (fname, sname, email) VALUES (?, ?, ?)",
        ("John", "Doe", "john.doe@example.com"),
    )
    user_id = cursor.lastrowid

    # AUTH
    cursor.execute(
        "INSERT INTO auth (user_id, username, password, email) VALUES (?, ?, ?, ?)",
        (user_id, "johndoe", "hashed_password_placeholder", "john.doe@example.com"),
    )

    # BOOKING
    cursor.execute(
        "INSERT INTO booking (venue_id, user_id, start_time, end_time, booking_date) "
        "VALUES (?, ?, ?, ?, ?)",
        (venue_id, user_id, "14:00", "15:00", "2026-07-24"),
    )

    db_conn.commit()
    db_conn.close()
