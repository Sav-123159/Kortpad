#!/usr/bin/env python3
import sys
from pathlib import Path
from sqlite3 import Error
from datetime import datetime, timedelta

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.database import get_db

from datetime import datetime, timedelta
from sqlite3 import Error


def seed_data():
    conn = get_db()
    cursor = conn.cursor()

    # Idempotency guard: none of these tables have a UNIQUE constraint on
    # their name columns, so INSERT OR IGNORE does NOT stop duplicate rows
    # on re-run. Check first instead.
    cursor.execute("SELECT COUNT(*) FROM campus")
    if cursor.fetchone()[0] > 0:
        print("Data already seeded — skipping to avoid duplicates.")
        conn.close()
        return True

    print("Seeding test data...")

    try:
        campus_map = {}
        faculty_map = {}
        building_map = {}
        venue_map = {}
        vertex_map = {}

        # ==========================================
        # 1. CAMPUS
        # ==========================================
        print("Seeding campuses...")
        campuses = [
            ("main", "Main Campus"),
            ("north", "North Campus"),
            ("south", "South Campus"),
            ("east", "East Campus"),
            ("west", "West Campus"),
        ]
        for key, name in campuses:
            cursor.execute("INSERT INTO campus (campus_name) VALUES (?)", (name,))
            campus_map[key] = cursor.lastrowid

        # ==========================================
        # 2. FACULTY
        # ==========================================
        print("Seeding faculties...")
        faculties = [
            ("engineering", "Faculty of Engineering"),
            ("science", "Faculty of Science"),
            ("arts", "Faculty of Arts"),
            ("business", "Faculty of Business"),
            ("medicine", "Faculty of Medicine"),
        ]
        for key, name in faculties:
            cursor.execute("INSERT INTO faculty (faculty_name) VALUES (?)", (name,))
            faculty_map[key] = cursor.lastrowid

        # ==========================================
        # 3. BUILDING
        # (key, campus_key, name, faculty_key) -- campus_key is the source
        # of truth for which campus this building belongs to; the vertex/
        # edge section below is built FROM this, not independently guessed.
        # ==========================================
        print("Seeding buildings...")
        buildings = [
            ("engineering_tower", "main", "Engineering Tower", "engineering"),
            ("science_hall", "main", "Science Hall", "science"),
            ("arts_building", "main", "Arts Building", "arts"),
            ("business_school", "main", "Business School", "business"),
            ("medical_center", "main", "Medical Center", "medicine"),

            ("engineering_annex", "north", "Engineering Annex", "engineering"),
            ("science_lab", "north", "Science Lab", "science"),
            ("arts_studio", "north", "Arts Studio", "arts"),

            ("business_hub", "south", "Business Hub", "business"),
            ("medical_clinic", "south", "Medical Clinic", "medicine"),

            ("research_center", "east", "Research Center", "science"),
            ("innovation_lab", "east", "Innovation Lab", "engineering"),

            ("performing_arts", "west", "Performing Arts", "arts"),
            ("entrepreneurship_center", "west", "Entrepreneurship Center", "business"),
        ]
        for key, campus_key, name, faculty_key in buildings:
            cursor.execute("""
                INSERT INTO building (campus_id, building_name, faculty_id)
                VALUES (?, ?, ?)
            """, (campus_map[campus_key], name, faculty_map[faculty_key]))
            building_map[key] = cursor.lastrowid

        # ==========================================
        # 4. VENUE
        # ==========================================
        print("Seeding venues...")
        venues = [
            ("room_101", "engineering_tower", "Room 101", 40),
            ("room_102", "engineering_tower", "Room 102", 30),
            ("lecture_hall_a", "engineering_tower", "Lecture Hall A", 120),
            ("computer_lab", "engineering_tower", "Computer Lab", 25),
            ("eng_seminar_room", "engineering_tower", "Seminar Room", 20),

            ("room_201", "science_hall", "Room 201", 35),
            ("room_202", "science_hall", "Room 202", 35),
            ("chemistry_lab", "science_hall", "Chemistry Lab", 24),
            ("physics_lab", "science_hall", "Physics Lab", 24),
            ("lecture_hall_b", "science_hall", "Lecture Hall B", 100),

            ("studio_1", "arts_building", "Studio 1", 15),
            ("studio_2", "arts_building", "Studio 2", 15),
            ("gallery_space", "arts_building", "Gallery Space", 50),
            ("music_room", "arts_building", "Music Room", 20),
            ("drama_theater", "arts_building", "Drama Theater", 80),

            ("room_401", "business_school", "Room 401", 30),
            ("room_402", "business_school", "Room 402", 30),
            ("case_study_room", "business_school", "Case Study Room", 20),
            ("executive_suite", "business_school", "Executive Suite", 10),
            ("lecture_hall_c", "business_school", "Lecture Hall C", 90),

            ("clinic_room_1", "medical_center", "Clinic Room 1", 5),
            ("clinic_room_2", "medical_center", "Clinic Room 2", 5),
            ("lecture_hall_d", "medical_center", "Lecture Hall D", 80),
            ("anatomy_lab", "medical_center", "Anatomy Lab", 30),
            ("med_seminar_room", "medical_center", "Seminar Room", 15),

            ("room_601", "engineering_annex", "Room 601", 25),
            ("room_602", "engineering_annex", "Room 602", 25),
            ("workshop", "engineering_annex", "Workshop", 15),

            ("microbiology_lab", "science_lab", "Microbiology Lab", 20),
            ("genetics_lab", "science_lab", "Genetics Lab", 20),

            ("painting_studio", "arts_studio", "Painting Studio", 12),
            ("sculpture_studio", "arts_studio", "Sculpture Studio", 12),

            ("boardroom_a", "business_hub", "Boardroom A", 15),
            ("boardroom_b", "business_hub", "Boardroom B", 15),

            ("treatment_room", "medical_clinic", "Treatment Room", 4),
            ("consultation_room", "medical_clinic", "Consultation Room", 3),
        ]
        for key, building_key, name, capacity in venues:
            cursor.execute("""
                INSERT INTO venue (building_id, venue_name, capacity)
                VALUES (?, ?, ?)
            """, (building_map[building_key], name, capacity))
            venue_map[key] = cursor.lastrowid

        # ==========================================
        # 5. EQUIPMENT
        # ==========================================
        print("Seeding equipment...")
        equipment = [
            ("computer_lab", "Desktop Computer", 25),
            ("computer_lab", "Monitor", 25),
            ("computer_lab", "Keyboard", 25),
            ("computer_lab", "Mouse", 25),
            ("computer_lab", "Projector", 1),

            ("chemistry_lab", "Microscope", 12),
            ("chemistry_lab", "Centrifuge", 3),
            ("chemistry_lab", "Bunsen Burner", 15),
            ("chemistry_lab", "Safety Goggles", 24),
            ("chemistry_lab", "Lab Coats", 24),

            ("physics_lab", "Oscilloscope", 8),
            ("physics_lab", "Multimeter", 12),
            ("physics_lab", "Circuit Kits", 12),
            ("physics_lab", "Optics Bench", 6),
            ("physics_lab", "Data Logger", 6),

            ("music_room", "Piano", 1),
            ("music_room", "Guitar", 3),
            ("music_room", "Drum Kit", 1),
            ("music_room", "Amplifier", 2),
            ("music_room", "Microphone Stand", 4),

            ("anatomy_lab", "Anatomical Models", 10),
            ("anatomy_lab", "Skeleton", 2),
            ("anatomy_lab", "Dissection Kit", 12),
            ("anatomy_lab", "Refrigerator", 2),
            ("anatomy_lab", "Sterilizer", 2),

            ("workshop", "Drill Press", 2),
            ("workshop", "Table Saw", 1),
            ("workshop", "Welding Kit", 3),
            ("workshop", "Safety Gear", 15),
            ("workshop", "Workbench", 8),
        ]
        for venue_key, equip_name, qty in equipment:
            cursor.execute("""
                INSERT INTO equipment (venue_id, equip_name, equip_qty)
                VALUES (?, ?, ?)
            """, (venue_map[venue_key], equip_name, qty))

        # ==========================================
        # 6. VERTEX
        # Schema only allows level IN ('campus', 'building') -- no 'venue'
        # option exists on the CHECK constraint. Room-level vertices are
        # therefore NOT valid data right now and have been left out.
        # See note at the bottom of this file about adding that level.
        # ==========================================
        print("Seeding vertices...")
        vertex_data = [
            # (key, level, campus_key_or_None, building_key_or_None, lat, lon)
            ("main_campus_v",  "campus", "main",  None, -33.932608, 18.864631),
            ("north_campus_v", "campus", "north", None, -33.925000, 18.870000),
            ("south_campus_v", "campus", "south", None, -33.940000, 18.860000),
            ("east_campus_v",  "campus", "east",  None, -33.930000, 18.880000),
            ("west_campus_v",  "campus", "west",  None, -33.935000, 18.850000),

            ("engineering_tower_v", "building", None, "engineering_tower", -33.932608, 18.864631),
            ("science_hall_v",      "building", None, "science_hall",      -33.932700, 18.864800),
            ("arts_building_v",     "building", None, "arts_building",     -33.932800, 18.864900),
            ("business_school_v",   "building", None, "business_school",   -33.932900, 18.865000),
            ("medical_center_v",    "building", None, "medical_center",    -33.933000, 18.865100),
            ("engineering_annex_v", "building", None, "engineering_annex", -33.925000, 18.870000),
            ("science_lab_v",       "building", None, "science_lab",       -33.925100, 18.870100),
            ("arts_studio_v",       "building", None, "arts_studio",       -33.925200, 18.870200),
            ("business_hub_v",      "building", None, "business_hub",      -33.940000, 18.860000),
            ("medical_clinic_v",    "building", None, "medical_clinic",    -33.940100, 18.860100),
            ("research_center_v",   "building", None, "research_center",   -33.930100, 18.880100),
            ("innovation_lab_v",    "building", None, "innovation_lab",    -33.930200, 18.880200),
            ("performing_arts_v",   "building", None, "performing_arts",   -33.935100, 18.850100),
            ("entrepreneurship_center_v", "building", None, "entrepreneurship_center", -33.935200, 18.850200),
        ]
        for key, level, campus_key, building_key, lat, lon in vertex_data:
            campus_id = campus_map[campus_key] if campus_key else None
            building_id = building_map[building_key] if building_key else None
            cursor.execute("""
                INSERT INTO vertex (campus_id, building_id, venue_id, level, latitude, longitude)
                VALUES (?, ?, NULL, ?, ?, ?)
            """, (campus_id, building_id, level, lat, lon))
            vertex_map[key] = cursor.lastrowid

        # ==========================================
        # 7. EDGE
        # Each campus hub connects only to buildings that ACTUALLY belong
        # to that campus (per the `buildings` list above) -- this is the
        # exact bug that caused North/East Campus to wire into Engineering
        # Tower (a Main Campus building) last time.
        # ==========================================
        print("Seeding edges...")

        def add_edge(key_a, key_b, weight):
            va, vb = vertex_map[key_a], vertex_map[key_b]
            lo, hi = (va, vb) if va < vb else (vb, va)
            cursor.execute(
                "INSERT INTO edge (vertex_a, vertex_b, weight) VALUES (?, ?, ?)",
                (lo, hi, weight),
            )

        edges = [
            ("main_campus_v", "engineering_tower_v", 1.5),
            ("main_campus_v", "science_hall_v", 2.0),
            ("main_campus_v", "arts_building_v", 2.5),
            ("main_campus_v", "business_school_v", 2.2),
            ("main_campus_v", "medical_center_v", 2.8),

            ("north_campus_v", "engineering_annex_v", 0.8),
            ("north_campus_v", "science_lab_v", 1.0),
            ("north_campus_v", "arts_studio_v", 1.2),

            ("south_campus_v", "business_hub_v", 0.9),
            ("south_campus_v", "medical_clinic_v", 1.1),

            ("east_campus_v", "research_center_v", 1.0),
            ("east_campus_v", "innovation_lab_v", 1.3),

            ("west_campus_v", "performing_arts_v", 0.9),
            ("west_campus_v", "entrepreneurship_center_v", 1.1),
        ]
        for key_a, key_b, weight in edges:
            add_edge(key_a, key_b, weight)

        # ==========================================
        # 8. TIMETABLE
        # ==========================================
        print("Seeding timetables...")
        today = datetime.now().date()
        semester_start = today.replace(month=2, day=1) if today.month >= 2 else today.replace(month=7, day=1)
        semester_end = semester_start + timedelta(days=120)

        timetables = [
            ("room_101", 'MON', '08:00', '09:30', 'MATH101'),
            ("room_101", 'WED', '08:00', '09:30', 'MATH101'),
            ("room_102", 'TUE', '10:00', '11:30', 'PHYS101'),
            ("room_102", 'THU', '10:00', '11:30', 'PHYS101'),
            ("lecture_hall_a", 'MON', '14:00', '16:00', 'CHEM101'),
            ("lecture_hall_a", 'WED', '14:00', '16:00', 'CHEM101'),
            ("lecture_hall_a", 'FRI', '09:00', '11:00', 'CHEM101'),
            ("computer_lab", 'TUE', '13:00', '14:30', 'CS101'),
            ("computer_lab", 'THU', '13:00', '14:30', 'CS101'),
            ("eng_seminar_room", 'WED', '10:00', '11:30', 'ENG101'),
            ("eng_seminar_room", 'FRI', '10:00', '11:30', 'ENG101'),
            ("room_201", 'MON', '11:00', '12:30', 'BIOL101'),
            ("room_201", 'WED', '11:00', '12:30', 'BIOL101'),
            ("studio_1", 'TUE', '14:00', '16:00', 'ART101'),
            ("studio_1", 'THU', '14:00', '16:00', 'ART101'),
            ("music_room", 'MON', '10:00', '11:30', 'MUS101'),
            ("music_room", 'WED', '10:00', '11:30', 'MUS101'),
            ("boardroom_a", 'FRI', '09:00', '10:30', 'BUS101'),
            ("clinic_room_1", 'TUE', '09:00', '10:30', 'MED101'),
            ("clinic_room_1", 'THU', '09:00', '10:30', 'MED101'),
            ("anatomy_lab", 'MON', '13:00', '15:00', 'MED201'),
            ("anatomy_lab", 'WED', '13:00', '15:00', 'MED201'),
        ]
        for venue_key, day, start, end, module in timetables:
            cursor.execute("""
                INSERT INTO timetable
                (venue_id, day_of_week, start_time, end_time, module_code, semester_start, semester_end)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (venue_map[venue_key], day, start, end, module, semester_start, semester_end))

        # ==========================================
        # 9. APP_USER
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
            INSERT INTO app_user (fname, sname, email)
            VALUES (?, ?, ?)
        """, users)

        # ==========================================
        # 10. BOOKING
        # (unchanged in approach -- this already pulled real IDs via SELECT
        # rather than hardcoding them, which was correct)
        # ==========================================
        print("Seeding bookings...")
        cursor.execute("SELECT user_id FROM app_user LIMIT 5")
        user_ids = [row[0] for row in cursor.fetchall()]

        cursor.execute("SELECT venue_id FROM venue LIMIT 10")
        venue_ids = [row[0] for row in cursor.fetchall()]

        booking_data = []
        today = datetime.now().date()
        for i in range(7):
            booking_date = today + timedelta(days=i)
            if booking_date.weekday() >= 5:
                continue
            for j in range(3):
                user_id = user_ids[j % len(user_ids)]
                venue_id = venue_ids[(j + i) % len(venue_ids)]
                start_hour = 9 + (j * 3)
                end_hour = start_hour + 1
                booking_data.append((
                    venue_id, user_id,
                    f"{start_hour:02d}:00:00", f"{end_hour:02d}:00:00",
                    booking_date,
                ))

        cursor.executemany("""
            INSERT INTO booking (venue_id, user_id, start_time, end_time, booking_date)
            VALUES (?, ?, ?, ?, ?)
        """, booking_data)

        conn.commit()

        print("\n" + "=" * 50)
        print("SEED COMPLETE! Data Summary:")
        print("=" * 50)
        tables = [
            ('campus', 'Campuses'), ('faculty', 'Faculties'), ('building', 'Buildings'),
            ('venue', 'Venues'), ('equipment', 'Equipment items'), ('vertex', 'Vertices'),
            ('edge', 'Edges'), ('timetable', 'Timetable entries'),
            ('app_user', 'App users'), ('booking', 'Bookings'),
        ]
        for table, label in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            print(f"Total {label:20s}: {cursor.fetchone()[0]}")
        print("=" * 50)
        print("Database ready for testing!")

        conn.close()
        return True

    except Error as e:
        print(f"Database error: {e}")
        conn.rollback()
        conn.close()
        return False

if __name__ == "__main__":
    seed_data()
