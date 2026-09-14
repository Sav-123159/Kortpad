from pydantic import BaseModel, EmailStr
from datetime import time, date, datetime
from typing import Union, Literal

# Alle modelle vir data validering en struktuur word hier gestoor en erf Pydantic BaseModel.
# Elke databasis tabel wat die FRONTEND sal benodig word hier gemodelleer deur die gebruik van:
#                - 'n Base model wat meeste van al die data modelleer wat voorkom in die tabel
#                - 'n Create model wat die Base model se attribute erf en gebruik word slegs om net aan te toon in die API wanneer ons data ontvang om te POST met
#                - 'n Gewone model, gewoonlik met die naam van die tabel waarin ons werk, en dit erf ook die Base model se
#                  attribute saam met enige velde wat die gebruiker nie hoef te stel nie. Word hoofsaaklik gebruik vir GET metodes

# ===================== USER AND AUTH =====================
class Auth(BaseModel):
    password : str

class Login(BaseModel):
    email : str
    password : str

# User model se Base model
class UserBase(BaseModel):
    fname : str
    sname : str
    email : EmailStr
    is_admin : bool | None = False

# User model wat slegs gebruik word wanneer ons 'n User wil skep
class UserCreate(UserBase):
    pass

class AdminUserCreate(UserBase):
    is_admin : bool

# User se gewone model met velde wat automaties gestel word deur die databasis
class User(UserBase):
    user_id : int

# ===================== CAMPUS =====================

# Campus model se Base model
class CampusBase(BaseModel):
    campus_name : str

# Campus model wat slegs gebruik word wanneer 'n kampus geskep word 
class CampusCreate(CampusBase):
    pass

# Campus se gewone model met velde wat outomaties gestel word deur die databasis
class Campus(CampusBase):
    campus_id : int

# CampusMap se model wat gebruik word vir wanneer ons die kaart vir die gekose kampus wil laai
class CampusMap(BaseModel):
    campus_id : int
    image_path : str
    bounds_lat : int
    bounds_lon : int
    
# ===================== BUILDING =====================

# Building se Base model
class BuildingBase(BaseModel):
    campus_id : int
    building_name : str

# Building model wat slegs gebruik word wanneer 'n Building geskep word
class BuildingCreate(BuildingBase):
    pass

# Building se gewone model met velde wat outomaties gestel word deur die databasis
class Building(BuildingBase):
    building_id : int

# BuildingMap se model wat gebruik word vir wanneer ons die kaart kort vir enige geboue waarin/waar deur ons moet navigeer
class BuildingMap(BaseModel):
    building_id : int
    floor : int
    image_path : str
    bounds_lat : int
    bounds_lon : int

# ===================== VENUE =====================

# Venue se Base model
class VenueBase(BaseModel):
    building_id : int
    venue_name : str
    capacity : int | None = None
    floor : int

# Venue model wat slegs gebruik word wanneer 'n Venue geskep word
class VenueCreate(VenueBase):
    pass

# Venue se gewone model met velde wat outomaties gestel word deur die databasis
class Venue(VenueBase):
    venue_id : int

# ===================== TIMETABLE =====================

# Timetable se Base model
class TimetableBase(BaseModel):
    venue_id : int
    day_of_week : str
    start_time : time
    end_time : time
    module_code : str
    semester_start : date
    semester_end : date

# Timetable model wat slegs gebruik word wanneer 'n Timetable geskep word
class TimetableCreate(TimetableBase):
    pass

# Timetable se gewone model met velde wat outomaties gestel word deur die databasis
class Timetable(TimetableBase):
    timetable_id : int

# ===================== BOOKING =====================

# Booking se Base model
class BookingBase(BaseModel):
    venue_id : int
    user_id : int
    start_time : time
    end_time : time
    booking_date : date

# Booking model wat slegs gebruik word wanneer 'n Booking geskep word
class BookingCreate(BookingBase):
    pass

# Booking se gewone model met velde wat outomaties gestel word deur die databasis
class Booking(BookingBase):
    booking_id : int
    booking_created_at : datetime

# ===================== EQUIPMENT =====================

# Equipment se Base model
class EquipmentBase(BaseModel):
    venue_id : int
    equip_name : str
    equip_qty : int

# Equipment model wat slegs gebruik word wanneer Equipment geskep word
class EquipmentCreate(EquipmentBase):
    pass

# Equipment se gewone model met velde wat outomaties gestel word deur die databasis
class Equipment(EquipmentBase):
    equipment_id : int
    
# ===================== ROUTE =====================

# Die modelle hieronder word gebruik om die struktuur van die roete data vas te stel wat ons gebruik om enige navigasie logika toe te pas

# In main.py gee meer konteks tot hoekom die Context modelle opgebreek word tussen Campus en Building. Wanneer ons die roete bepaal wat die gebruiker moet vat
# moet ons op 'n manier kan bepaal wanneer die gebruiker deur 'n gebou moet beweeg en wanneer hulle buite deur die kampus moet beweeg.
class CampusContext(BaseModel):
    level : Literal['campus']
    campus_id : int

# Wanneer die gebruiker deur 'n gebou moet beweeg moet ons kan weet op watse vloer die huidige deel van die roete sodat ons kan bepaal watse kaart om te vertoon
class BuildingContext(BaseModel):
    level : Literal['building']
    building_id : int
    floor : int

# Die Route se path_data, is waar ons die vol roete stoor saam met die totale afstand van die Route wat gevat moet word. Context verwys na hoe die data gaan lyk en omdat ons dit met models
# gestel het is sodat ons daardie struktuur kan valideer en seker maak dat net die korrekte pakkette gemaak kan word.
# Union se vir ons model dat ons struktuur vir context mag lyk soos of CampusContext of BuildingContext
class Segment(BaseModel):
    context : Union[CampusContext, BuildingContext]
    coordinates : list[list[float]]

# Route model wat die finale struktuur van ons roete stoor en maak
class Route(BaseModel):
    path_data: list[Segment]
    distance : float
