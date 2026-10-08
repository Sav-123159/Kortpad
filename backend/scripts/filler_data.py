#!/usr/bin/env python3
import os
import random
import sqlite3
from datetime import date, timedelta
from pathlib import Path
import bcrypt

BACKEND_DIR = Path(__file__).parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"

DATABASE_PATH = os.getenv(
    "DATABASE_PATH",
    str(DATA_DIR / "database.db")
)

DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

TIMETABLE_SLOTS = [
    ("08:00:00", "09:00:00"), ("08:00:00", "10:00:00"),
    ("09:00:00", "10:00:00"), ("09:00:00", "11:00:00"),
    ("10:00:00", "11:00:00"), ("10:00:00", "12:00:00"),
    ("11:00:00", "12:00:00"), ("11:00:00", "13:00:00"),
    ("12:00:00", "13:00:00"), ("12:00:00", "14:00:00"),
    ("13:00:00", "14:00:00"), ("13:00:00", "15:00:00"),
    ("15:00:00", "17:00:00")
]

BOOKING_START_HOURS = range(8, 16)

TEST_PASSWORD = "Test1234!"

NUMBER_OF_USERS = 100
NUMBER_OF_TIMETABLES = 100
NUMBER_OF_BOOKINGS = 100

BOOKING_START_DATE = date(2026, 10, 12)
BOOKING_DAYS = 66

SEMESTER_START = "2026-07-01"
SEMESTER_END = "2026-12-30"

def hash_password(plain_password):
    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(
        plain_password.encode("utf-8"),
        salt
    )

    return hashed.decode("utf-8")

def seed_users(cursor):
    first_names = [
        "Anke", "Pieter", "Johan", "Marlize", "Hendrik", "Esmarie", "Gerhard",
        "Willem", "Carien", "Eva", "Dylan", "Lize", "Tiaan", "Stephan",
        "Mariska", "Ruan", "Jessica", "Hannes", "Jolyn", "Bella", "Brandon",
        "Carmen", "Christiaan", "Hailey", "Jaco", "Mia", "Emma"
    ]

    last_names = [
        "Botha", "Pretorius", "Nel", "Venter", "Steyn", "Joubert", "Kruger",
        "Coetzee", "Fourie", "Marais", "De Beer", "Van der Merwe", "Van Wyk",
        "Van Zyl", "Van Heerden", "Van Rooyen", "Van Rensburg", "Van Niekerk",
        "Van der Walt", "Van Staden", "Immelman", "Lochenberg", "Mouton", "Meyer",
        "Steenkamp", "Ras", "Smit", "Bester"
    ]

    possible_names = [
        (fname, sname)
        for fname in first_names
        for sname in last_names
    ]

    random.seed(2026)
    random.shuffle(possible_names)

    users = []

    for i in range(NUMBER_OF_USERS):
        fname, sname = possible_names[i]

        email = (
            f"{fname.lower().replace(' ', '')}"
            f"{sname.lower().replace(' ', '')}"
            f"{i + 1}@example.com"
        )

        cursor.execute("""
            INSERT INTO app_user
                (fname, sname, email, is_admin)
            VALUES
                (?, ?, ?, ?)
        """, (
            fname,
            sname,
            email,
            0
        ))

        user_id = cursor.lastrowid

        users.append({
            "user_id": user_id,
            "fname": fname,
            "sname": sname,
            "email": email
        })

    return users

def seed_auth(cursor, users):
    password_hash = hash_password(TEST_PASSWORD)

    auth_records = []

    for user in users:
        auth_records.append((
            user["user_id"],
            password_hash,
            user["email"]
        ))

    cursor.executemany("""
        INSERT INTO auth
            (user_id, password, email)
        VALUES
            (?, ?, ?)
    """, auth_records)

def seed_modules(cursor):
    modules = [
        "NWIKA151", "NWIAL152", "NSTAW152", "NPRKO151", "NTWIN151",
        "NTWIN152", "NSTAT151", "NTOPR152", "NWILA261", "NRORG261",
        "NDSAL261", "NPBES262", "NDATA262", "NDABS262", "NMTEG152",
        "NIROB152", "NIWOL152", "NSPLO151", "NWIVA261", "NSTVT261",
        "NTWWM262", "NTWDI262", "NSTAF262", "OPVGI161", "OPVGF272",
        "OPVGI271", "OPVIF272", "OAPIF261", "OPAIF262", "OPOIF150",
        "OPOIF260", "OPOIG360", "OWIGF360", "OWIIF360", "OVKOG360",
        "OPVGI371", "OPVGI372", "OAFGI150", "OENGI150", "OAHGF360",
        "OEAGF360", "OAHIF360", "OEAIF360", "OWOIF360", "OWKGI150",
        "OWKGI260", "OWOGF360", "OLVGI150", "OLVGI260", "OLOGF360",
        "ONTIF150", "ONTIF260", "ONTOI360", "OSWIF150", "OSWIF260",
        "OSOIF360", "OEBIF360", "RPREG151", "RFREG152", "RAETR150",
        "RIREG150", "RKREG260", "REREG260", "RKORG260", "RREPL260",
        "RRUIT261", "RAREG262", "RBKON262", "RDREG370", "RAREG370",
        "RIGRG370", "ROREG370", "RRFLO370", "EBREK150", "EFREK150",
        "ESTAT150", "EEKON150", "EETIE151", "ESREG152", "EFIBS260",
        "EBREK260", "EFREK260", "EORBS260", "EBELA260", "EOUDK260",
        "EBREK370", "EFREK370", "EORBS370", "EFIBS370", "EFIBB150",
        "EONBS150", "EBLBS260", "EEKON261", "EEKON262", "EFIBP260",
        "EBELA370", "EBEBS370", "EEKON370", "EFIBP370", "EGFBP370"
    ]

    modules = list(dict.fromkeys(modules))

    module_records = [
        (module_code,)
        for module_code in modules
    ]

    cursor.executemany("""
        INSERT INTO module (module_name)
        VALUES (?)
    """, module_records)

    return modules

def get_venues(cursor):
    cursor.execute("""
        SELECT venue_id
        FROM venue
        ORDER BY venue_id
    """)

    return [row[0] for row in cursor.fetchall()]

def get_modules(cursor):
    cursor.execute("""
        SELECT module_name
        FROM module
        ORDER BY module_id
    """)

    return [row[0] for row in cursor.fetchall()]

def seed_timetable(cursor):
    venues = get_venues(cursor)
    modules = get_modules(cursor)

    if not venues:
        raise RuntimeError(
            "No venues exist in the database. "
            "Add venues before running filler_data.py."
        )

    if not modules:
        raise RuntimeError(
            "No modules exist in the database. "
            "Add modules before running filler_data.py."
        )

    possible_slots = []

    for venue_id in venues:
        for day in DAYS:
            for start_time, end_time in TIMETABLE_SLOTS:
                possible_slots.append((
                    venue_id,
                    day,
                    start_time,
                    end_time
                ))

    random.seed(2026)
    random.shuffle(possible_slots)

    if len(possible_slots) < NUMBER_OF_TIMETABLES:
        raise RuntimeError(
            f"Only {len(possible_slots)} unique timetable slots "
            f"are available, but {NUMBER_OF_TIMETABLES} are required."
        )

    timetable_records = []

    for i in range(NUMBER_OF_TIMETABLES):

        venue_id, day, start_time, end_time = possible_slots[i]
        module_code = modules[i % len(modules)]

        timetable_records.append((
            venue_id,
            day,
            start_time,
            end_time,
            module_code,
            SEMESTER_START,
            SEMESTER_END
        ))

    cursor.executemany("""
        INSERT INTO timetable
            (
                venue_id,
                day_of_week,
                start_time,
                end_time,
                module_code,
                semester_start,
                semester_end
            )
        VALUES
            (?, ?, ?, ?, ?, ?, ?)
    """, timetable_records)

def has_booking_clash(
    cursor,
    venue_id,
    user_id,
    booking_date,
    start_time,
    end_time
):
    booking_date_string = booking_date.isoformat()

    cursor.execute("""
        SELECT 1
        FROM booking
        WHERE booking_date = ?
            AND ? < end_time
            AND ? > start_time
            AND (
                venue_id = ?
                OR
                user_id = ?
            )
        LIMIT 1
    """, (
        booking_date_string,
        start_time,
        end_time,
        venue_id,
        user_id
    ))

    if cursor.fetchone() is not None:
        return True

    day_of_week = DAYS[(booking_date.weekday() + 1) % 7]

    cursor.execute("""
        SELECT 1
        FROM timetable
        WHERE venue_id = ?
            AND day_of_week = ?
            AND ? BETWEEN semester_start AND semester_end
            AND ? < end_time
            AND ? > start_time
        LIMIT 1
    """, (
        venue_id,
        day_of_week,
        booking_date_string,
        start_time,
        end_time
    ))

    if cursor.fetchone() is not None:
        return True

    return False

def generate_weekday_dates():
    dates = []

    for day_offset in range(BOOKING_DAYS + 1):

        current_date = (
            BOOKING_START_DATE +
            timedelta(days=day_offset)
        )

        if current_date.weekday() <= 4:
            dates.append(current_date)

    return dates

def seed_bookings(cursor, users):
    venues = get_venues(cursor)

    if not venues:
        raise RuntimeError(
            "No venues exist in the database. "
            "Add venues before running filler_data.py."
        )

    if not users:
        raise RuntimeError(
            "No users were created. "
            "Bookings require users."
        )

    booking_dates = generate_weekday_dates()

    if not booking_dates:
        raise RuntimeError(
            "No valid weekdays were generated for bookings."
        )

    random.seed(2026)

    candidates = []

    for booking_date in booking_dates:
        for venue_id in venues:
            for start_hour in BOOKING_START_HOURS:

                duration = random.choice([1, 2])
                end_hour = start_hour + duration

                if end_hour > 17:
                    continue

                start_time = f"{start_hour:02d}:00:00"
                end_time = f"{end_hour:02d}:00:00"

                candidates.append((
                    booking_date,
                    venue_id,
                    start_time,
                    end_time
                ))

    random.shuffle(candidates)

    count = 0

    for booking_date, venue_id, start_time, end_time in candidates:

        if count >= NUMBER_OF_BOOKINGS:
            break

        user_ids = [user["user_id"] for user in users]
        random.shuffle(user_ids)

        booking_created = False

        for user_id in user_ids:

            if has_booking_clash(
                cursor,
                venue_id,
                user_id,
                booking_date,
                start_time,
                end_time
            ):
                continue

            cursor.execute("""
                INSERT INTO booking
                    (
                        venue_id,
                        user_id,
                        start_time,
                        end_time,
                        booking_date
                    )
                VALUES
                    (?, ?, ?, ?, ?)
            """, (
                venue_id,
                user_id,
                start_time,
                end_time,
                booking_date.isoformat()
            ))

            count += 1
            booking_created = True
            break

        if not booking_created:
            continue

    if count < NUMBER_OF_BOOKINGS:
        raise RuntimeError(
            f"Only {count} valid bookings could be created. "
            f"{NUMBER_OF_BOOKINGS} were requested."
        )

def already_seeded(cursor):
    cursor.execute("""
        SELECT COUNT(*)
        FROM app_user
        WHERE email LIKE '%@example.com'
    """)

    user_count = cursor.fetchone()[0]

    return user_count > 0

def seed_database():
    if not Path(DATABASE_PATH).exists():

        print("ERROR: database.db was not found.")
        print()
        print("Expected location:")
        print(f"    {DATABASE_PATH}")
        print()

        return False

    connection = sqlite3.connect(DATABASE_PATH)

    connection.execute("PRAGMA foreign_keys = ON")

    cursor = connection.cursor()

    try:

        required_tables = [
            "app_user", "auth", "venue",
            "module", "timetable", "booking"
        ]

        for table in required_tables:

            cursor.execute("""
                SELECT name
                FROM sqlite_master
                WHERE type = 'table'
                    AND name = ?
            """, (table,))

            if cursor.fetchone() is None:
                raise RuntimeError(
                    f"Required table '{table}' does not exist."
                )

        if already_seeded(cursor):
            print("Database is already seeded.")

            connection.close()

            return False

        users = seed_users(cursor)
        seed_auth(cursor, users)
        seed_modules(cursor)
        seed_timetable(cursor)
        seed_bookings(cursor, users)

        connection.commit()

        print("DATABASE SEEDED SUCCESSFULLY")

        return True

    except Exception as error:
        connection.rollback()

        print("DATABASE SEEDING FAILED")
        print(f"Error: {error}")

        return False

    finally:
        connection.close()

if __name__ == "__main__":
    seed_database()
    