from pydantic import BaseModel
from datetime import time, date, datetime

class UserBase(BaseModel):
    fname : str
    sname : str
    email : str

class UserCreate(UserBase):
    pass

class User(UserBase):
    user_id : int

class CampusBase(BaseModel):
    campus_name : str
    
class CampusCreate(CampusBase):
    pass
    
class Campus(CampusBase):
    campus_id : int

class BuildingBase(BaseModel):
    campus_id : int
    building_name : str
    faculty_id : int
    
class BuildingCreate(BuildingBase):
    pass

class Building(BuildingBase):
    building_id : int

class VenueBase(BaseModel):
    building_id : int
    venue_name : str
    capacity : int | None = None
    
class VenueCreate(VenueBase):
    pass

class Venue(VenueBase):
    venue_id : int

class TimetableBase(BaseModel):
    venue_id : int
    day_of_week : str
    start_time : time
    end_time : time
    module_code : str
    semester_start : date
    semester_end : date

class TimetableCreate(TimetableBase):
    pass

class Timetable(TimetableBase):
    timetable_id : int

class BookingBase(BaseModel):
    venue_id : int
    user_id : int
    start_time : time
    end_time : time
    booking_date : date
    
class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    booking_id : int
    booking_created_at : datetime

class EquipmentBase(BaseModel):
    venue_id : int
    equipment_name : str
    equip_qty : int
    
class EquipmentCreate(EquipmentBase):
    pass

class Equipment(EquipmentBase):
    equipment_id : int
