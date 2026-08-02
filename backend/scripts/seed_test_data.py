#!/usr/bin/env python3
import sys
from pathlib import Path
from sqlite3 import Error
from datetime import datetime, timedelta

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.database import get_db

def seed_data():
    conn = get_db()
    cursor = conn.cursor()
    
    print("Seeding test data...")
    
    try:
        # ==========================================
        # 1. CAMPUS Data
        # ==========================================
        print("Seeding campuses...")
        campuses = [
            ("Main Campus",),
            ("North Campus",),
            ("South Campus",),
            ("East Campus",),
            ("West Campus",),
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO campus (campus_name)
            VALUES (?)
        """, campuses)
        
        # ==========================================
        # 2. FACULTY Data
        # ==========================================
        print("Seeding faculties...")
        faculties = [
            ("Faculty of Engineering",),
            ("Faculty of Science",),
            ("Faculty of Arts",),
            ("Faculty of Business",),
            ("Faculty of Medicine",),
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO faculty (faculty_name)
            VALUES (?)
        """, faculties)
        
        # ==========================================
        # 3. BUILDING Data
        # ==========================================
        print("Seeding buildings...")
        buildings = [
            # Main Campus (campus_id=1)
            (1, "Engineering Tower", 1),
            (1, "Science Hall", 2),
            (1, "Arts Building", 3),
            (1, "Business School", 4),
            (1, "Medical Center", 5),
            # North Campus (campus_id=2)
            (2, "Engineering Annex", 1),
            (2, "Science Lab", 2),
            (2, "Arts Studio", 3),
            # South Campus (campus_id=3)
            (3, "Business Hub", 4),
            (3, "Medical Clinic", 5),
            # East Campus (campus_id=4)
            (4, "Research Center", 2),
            (4, "Innovation Lab", 1),
            # West Campus (campus_id=5)
            (5, "Performing Arts", 3),
            (5, "Entrepreneurship Center", 4),
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO building (campus_id, building_name, faculty_id)
            VALUES (?, ?, ?)
        """, buildings)
        
        # ==========================================
        # 4. VENUE Data
        # ==========================================
        print("Seeding venues...")
        venues = [
            # Engineering Tower (building_id=1)
            (1, "Room 101", 40),
            (1, "Room 102", 30),
            (1, "Lecture Hall A", 120),
            (1, "Computer Lab", 25),
            (1, "Seminar Room", 20),
            # Science Hall (building_id=2)
            (2, "Room 201", 35),
            (2, "Room 202", 35),
            (2, "Chemistry Lab", 24),
            (2, "Physics Lab", 24),
            (2, "Lecture Hall B", 100),
            # Arts Building (building_id=3)
            (3, "Studio 1", 15),
            (3, "Studio 2", 15),
            (3, "Gallery Space", 50),
            (3, "Music Room", 20),
            (3, "Drama Theater", 80),
            # Business School (building_id=4)
            (4, "Room 401", 30),
            (4, "Room 402", 30),
            (4, "Case Study Room", 20),
            (4, "Executive Suite", 10),
            (4, "Lecture Hall C", 90),
            # Medical Center (building_id=5)
            (5, "Clinic Room 1", 5),
            (5, "Clinic Room 2", 5),
            (5, "Lecture Hall D", 80),
            (5, "Anatomy Lab", 30),
            (5, "Seminar Room", 15),
            # Engineering Annex (building_id=6)
            (6, "Room 601", 25),
            (6, "Room 602", 25),
            (6, "Workshop", 15),
            # Science Lab (building_id=7)
            (7, "Microbiology Lab", 20),
            (7, "Genetics Lab", 20),
            # Arts Studio (building_id=8)
            (8, "Painting Studio", 12),
            (8, "Sculpture Studio", 12),
            # Business Hub (building_id=9)
            (9, "Boardroom A", 15),
            (9, "Boardroom B", 15),
            # Medical Clinic (building_id=10)
            (10, "Treatment Room", 4),
            (10, "Consultation Room", 3),
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO venue (building_id, venue_name, capacity)
            VALUES (?, ?, ?)
        """, venues)
        
        # ==========================================
        # 5. EQUIPMENT Data
        # ==========================================
        print("🔧 Seeding equipment...")
        equipment = [
            # Computer Lab (venue_id=5)
            (5, "Desktop Computer", 25),
            (5, "Monitor", 25),
            (5, "Keyboard", 25),
            (5, "Mouse", 25),
            (5, "Projector", 1),
            # Chemistry Lab (venue_id=8)
            (8, "Microscope", 12),
            (8, "Centrifuge", 3),
            (8, "Bunsen Burner", 15),
            (8, "Safety Goggles", 24),
            (8, "Lab Coats", 24),
            # Physics Lab (venue_id=9)
            (9, "Oscilloscope", 8),
            (9, "Multimeter", 12),
            (9, "Circuit Kits", 12),
            (9, "Optics Bench", 6),
            (9, "Data Logger", 6),
            # Music Room (venue_id=14)
            (14, "Piano", 1),
            (14, "Guitar", 3),
            (14, "Drum Kit", 1),
            (14, "Amplifier", 2),
            (14, "Microphone Stand", 4),
            # Anatomy Lab (venue_id=24)
            (24, "Anatomical Models", 10),
            (24, "Skeleton", 2),
            (24, "Dissection Kit", 12),
            (24, "Refrigerator", 2),
            (24, "Sterilizer", 2),
            # Workshop (venue_id=27)
            (27, "Drill Press", 2),
            (27, "Table Saw", 1),
            (27, "Welding Kit", 3),
            (27, "Safety Gear", 15),
            (27, "Workbench", 8),
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO equipment (venue_id, equip_name, equip_qty)
            VALUES (?, ?, ?)
        """, equipment)
        
        # ==========================================
        # 6. VERTEX Data
        # ==========================================
        print("Seeding vertices...")
        vertices = [
            # Campus level vertices (campus_id, level, latitude, longitude)
            (1, None, None, 'campus', -33.932608, 18.864631),  # Main Campus
            (2, None, None, 'campus', -33.925000, 18.870000),  # North Campus
            (3, None, None, 'campus', -33.940000, 18.860000),  # South Campus
            (4, None, None, 'campus', -33.930000, 18.880000),  # East Campus
            (5, None, None, 'campus', -33.935000, 18.850000),  # West Campus
            
            # Building level vertices (campus_id, building_id, level, latitude, longitude)
            (None, 1, None, 'building', -33.932608, 18.864631),  # Engineering Tower
            (None, 2, None, 'building', -33.932700, 18.864800),  # Science Hall
            (None, 3, None, 'building', -33.932800, 18.864900),  # Arts Building
            (None, 4, None, 'building', -33.932900, 18.865000),  # Business School
            (None, 5, None, 'building', -33.933000, 18.865100),  # Medical Center
            (None, 6, None, 'building', -33.925000, 18.870000),  # Engineering Annex
            (None, 7, None, 'building', -33.925100, 18.870100),  # Science Lab
            (None, 8, None, 'building', -33.925200, 18.870200),  # Arts Studio
            (None, 9, None, 'building', -33.940000, 18.860000),  # Business Hub
            (None, 10, None, 'building', -33.940100, 18.860100), # Medical Clinic
            
            # Venue level vertices (building_id, venue_id, level, latitude, longitude)
            (None, None, 1, 'venue', -33.932610, 18.864632),  # Room 101
            (None, None, 2, 'venue', -33.932620, 18.864633),  # Room 102
            (None, None, 3, 'venue', -33.932630, 18.864634),  # Lecture Hall A
            (None, None, 4, 'venue', -33.932640, 18.864635),  # Computer Lab
            (None, None, 5, 'venue', -33.932650, 18.864636),  # Seminar Room
            (None, None, 10, 'venue', -33.932700, 18.864800), # Room 201
            (None, None, 15, 'venue', -33.932800, 18.864900), # Studio 1
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO vertex 
            (campus_id, building_id, venue_id, level, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?)
        """, vertices)
        
        # ==========================================
        # 7. EDGE Data
        # ==========================================
        print("Seeding edges...")
        edges = [
            (1, 6, 1.5),   # Main Campus -> Engineering Tower
            (1, 7, 2.0),   # Main Campus -> Science Hall
            (1, 8, 2.5),   # Main Campus -> Arts Building
            (6, 11, 0.3),  # Engineering Tower -> Room 101
            (6, 12, 0.4),  # Engineering Tower -> Room 102
            (6, 13, 0.5),  # Engineering Tower -> Lecture Hall A
            (6, 14, 0.6),  # Engineering Tower -> Computer Lab
            (7, 16, 0.4),  # Science Hall -> Room 201
            (8, 15, 0.3),  # Arts Building -> Studio 1
            (2, 6, 3.0),   # North Campus -> Engineering Tower
            (3, 9, 4.0),   # South Campus -> Business Hub
            (4, 6, 5.0),   # East Campus -> Engineering Tower
            (5, 8, 3.5),   # West Campus -> Arts Building
            (9, 18, 0.4),  # Business Hub -> Boardroom A
            (10, 19, 0.3), # Medical Clinic -> Treatment Room
            (11, 12, 0.2), # Room 101 -> Room 102
            (13, 14, 0.3), # Lecture Hall A -> Computer Lab
            (15, 16, 0.2), # Studio 1 -> Room 201
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO edge (vertex_a, vertex_b, weight)
            VALUES (?, ?, ?)
        """, edges)
        
        # ==========================================
        # 8. TIMETABLE Data
        # ==========================================
        print("Seeding timetables...")
        
        # Get semester dates (current semester)
        today = datetime.now().date()
        semester_start = today.replace(month=2, day=1) if today.month >= 2 else today.replace(month=7, day=1)
        semester_end = semester_start + timedelta(days=120)  # ~4 months
        
        timetables = [
            # Room 101 (venue_id=1)
            (1, 'MON', '08:00', '09:30', 'MATH101', semester_start, semester_end),
            (1, 'WED', '08:00', '09:30', 'MATH101', semester_start, semester_end),
            # Room 102 (venue_id=2)
            (2, 'TUE', '10:00', '11:30', 'PHYS101', semester_start, semester_end),
            (2, 'THU', '10:00', '11:30', 'PHYS101', semester_start, semester_end),
            # Lecture Hall A (venue_id=3)
            (3, 'MON', '14:00', '16:00', 'CHEM101', semester_start, semester_end),
            (3, 'WED', '14:00', '16:00', 'CHEM101', semester_start, semester_end),
            (3, 'FRI', '09:00', '11:00', 'CHEM101', semester_start, semester_end),
            # Computer Lab (venue_id=4)
            (4, 'TUE', '13:00', '14:30', 'CS101', semester_start, semester_end),
            (4, 'THU', '13:00', '14:30', 'CS101', semester_start, semester_end),
            # Seminar Room (venue_id=5)
            (5, 'WED', '10:00', '11:30', 'ENG101', semester_start, semester_end),
            (5, 'FRI', '10:00', '11:30', 'ENG101', semester_start, semester_end),
            # Room 201 (venue_id=6)
            (6, 'MON', '11:00', '12:30', 'BIOL101', semester_start, semester_end),
            (6, 'WED', '11:00', '12:30', 'BIOL101', semester_start, semester_end),
            # Studio 1 (venue_id=11)
            (11, 'TUE', '14:00', '16:00', 'ART101', semester_start, semester_end),
            (11, 'THU', '14:00', '16:00', 'ART101', semester_start, semester_end),
            # Music Room (venue_id=14)
            (14, 'MON', '10:00', '11:30', 'MUS101', semester_start, semester_end),
            (14, 'WED', '10:00', '11:30', 'MUS101', semester_start, semester_end),
            # Business Hub Boardroom (venue_id=18)
            (18, 'FRI', '09:00', '10:30', 'BUS101', semester_start, semester_end),
            # Clinic Room 1 (venue_id=21)
            (21, 'TUE', '09:00', '10:30', 'MED101', semester_start, semester_end),
            (21, 'THU', '09:00', '10:30', 'MED101', semester_start, semester_end),
            # Anatomy Lab (venue_id=24)
            (24, 'MON', '13:00', '15:00', 'MED201', semester_start, semester_end),
            (24, 'WED', '13:00', '15:00', 'MED201', semester_start, semester_end),
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO timetable 
            (venue_id, day_of_week, start_time, end_time, module_code, semester_start, semester_end)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, timetables)
        
        # ==========================================
        # 9. APP_USER Data
        # ==========================================
        print("Seeding app users...")
        users = [
            ("John", "Smith", "john.smith@university.edu"),
            ("Emma", "Johnson", "emma.j@university.edu"),
            ("Michael", "Brown", "michael.brown@university.edu"),
            ("Sarah", "Davis", "sarah.davis@university.edu"),
            ("James", "Wilson", "james.wilson@university.edu"),
            ("Emily", "Taylor", "emily.taylor@university.edu"),
            ("Robert", "Anderson", "robert.anderson@university.edu"),
            ("Lisa", "Martinez", "lisa.martinez@university.edu"),
            ("David", "Lee", "david.lee@university.edu"),
            ("Maria", "Garcia", "maria.garcia@university.edu"),
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO app_user (fname, sname, email)
            VALUES (?, ?, ?)
        """, users)
        
        # ==========================================
        # 10. BOOKING Data
        # ==========================================
        print("Seeding bookings...")
        
        # Get some existing users and venues for bookings
        cursor.execute("SELECT user_id FROM app_user LIMIT 5")
        user_ids = [row[0] for row in cursor.fetchall()]
        
        cursor.execute("SELECT venue_id FROM venue LIMIT 10")
        venue_ids = [row[0] for row in cursor.fetchall()]
        
        booking_data = []
        today = datetime.now().date()
        
        # Create bookings for next 7 days
        for i in range(7):
            booking_date = today + timedelta(days=i)
            # Skip weekends
            if booking_date.weekday() >= 5:  # Saturday=5, Sunday=6
                continue
                
            for j in range(3):  # 3 bookings per day
                user_id = user_ids[j % len(user_ids)]
                venue_id = venue_ids[(j + i) % len(venue_ids)]
                start_hour = 9 + (j * 3)  # 9:00, 12:00, 15:00
                end_hour = start_hour + 1
                start_time = f"{start_hour:02d}:00:00"
                end_time = f"{end_hour:02d}:00:00"
                booking_data.append((venue_id, user_id, start_time, end_time, booking_date))
        
        cursor.executemany("""
            INSERT OR IGNORE INTO booking 
            (venue_id, user_id, start_time, end_time, booking_date)
            VALUES (?, ?, ?, ?, ?)
        """, booking_data)
        
        # Commit all changes
        conn.commit()
        
        # Print summary statistics
        print("\n" + "="*50)
        print("SEED COMPLETE! Data Summary:")
        print("="*50)
        
        tables = [
            ('campus', 'Campuses'),
            ('faculty', 'Faculties'),
            ('building', 'Buildings'),
            ('venue', 'Venues'),
            ('equipment', 'Equipment items'),
            ('vertex', 'Vertices'),
            ('edge', 'Edges'),
            ('timetable', 'Timetable entries'),
            ('app_user', 'App users'),
            ('booking', 'Bookings'),
        ]
        
        for table, label in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"Total {label:20s}: {count}")
        
        print("="*50)
        print("Database ready for testing!")
        
        conn.close()
        return True
        
    except Error as e:
        print(f"Database error: {e}")
        conn.rollback()
        conn.close()
        return False

    conn.commit()
    conn.close()
    
    print(f"Seed complete")

if __name__ == "__main__":
    seed_data()
