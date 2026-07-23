from pydantic import BaseModel
from datetime import time, date, datetime

class User(BaseModel):
    user_id : int
    fname : str
    sname : str
    email : str

class Campus(BaseModel):
    campus_id : int
    campus_name : str

class Building(BaseModel):
    building_id : int
    campus_id : int
    building_name : str
    faculty_id : int

class Venue(BaseModel):
    venue_id : int
    building_id : int
    venue_name : str
    capacity : int

class Timetable(BaseModel):
    timetable_id : int
    venue_id : int
    day_of_week : str
    start_time : time
    end_time : time
    module_code : str
    semester_start : date
    semester_end : date

class Booking(BaseModel):
    booking_id : int
    venue_id : int
    user_id : int
    start_time : time
    end_time : time
    booking_date : date
    booking_created_at : datetime

class Equipment(BaseModel):
    equipment_id : int
    venue_id : int
    equipment_name : str
    equip_qty : int
