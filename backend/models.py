from pydantic import BaseModel, EmailStr
from datetime import time, date, datetime
from typing import Union, Literal

class Auth(BaseModel):
    password : str

class Login(BaseModel):
    email : str
    password : str

class UserBase(BaseModel):
    fname : str
    sname : str
    email : EmailStr
    is_admin : bool | None = False

class UserCreate(UserBase):
    pass

class AdminUserCreate(UserBase):
    is_admin : bool

class User(UserBase):
    user_id : int

class CampusBase(BaseModel):
    campus_name : str
    
class CampusCreate(CampusBase):
    pass
    
class Campus(CampusBase):
    campus_id : int

class CampusMap(BaseModel):
    campus_id : int
    image_path : str
    bounds_lat : int
    bounds_lon : int

class BuildingBase(BaseModel):
    campus_id : int
    building_name : str
    
class BuildingCreate(BuildingBase):
    pass

class Building(BuildingBase):
    building_id : int

class BuildingMap(BaseModel):
    building_id : int
    floor : int
    image_path : str
    bounds_lat : int
    bounds_lon : int

class VenueBase(BaseModel):
    building_id : int
    venue_name : str
    capacity : int | None = None
    floor : int
    
class VenueCreate(VenueBase):
    pass

class Venue(VenueBase):
    venue_id : int

class TimetableBase(BaseModel):
    venue_id : int
    day_of_week : str
    start_time : time
    end_time : time
    module_id : int
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
    equip_name : str
    equip_qty : int
    
class EquipmentCreate(EquipmentBase):
    pass

class Equipment(EquipmentBase):
    equipment_id : int
    
class CampusContext(BaseModel):
    level : Literal['campus']
    campus_id : int
    
class BuildingContext(BaseModel):
    level : Literal['building']
    building_id : int
    floor : int

class Segment(BaseModel):
    context : Union[CampusContext, BuildingContext]
    coordinates : list[list[float]]
    
class Route(BaseModel):
    path_data: list[Segment]
    distance : float
