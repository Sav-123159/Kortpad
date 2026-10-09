from sqlite3 import IntegrityError
from click import group
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import *
from database import init_db, get_db
from graph import GraphCache
from dijkstra import dijkstra
import bcrypt
import threading
from concurrent.futures import ThreadPoolExecutor
from itertools import islice

app = FastAPI()

origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
]

# Hier stel ons die toegelate domeins wat mag versoeke maak na die bediener
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

# Hierdie funksie maak seker dat die instansie van die bediener het 'n databasis
init_db()

# 'n Cache wat kampus kaarte stoor elke keer wat die Frontend 'n versoek maak vir 'n kaart,
# kan die bediener eers kyk of die kaart klaar gelaai is binne die cache om prestasie te spaar op komplekse data struktuur skeppings 
_map_cache = GraphCache()

# ==================== API ====================
# Daar bestaan basiese API CRUD metodes vir alle data wat modelle voor bestaan, soos:
#       - GET Metodes om een spesifieke rekord te kry of alle bestaande rekords te kry
#       - POST Metodes om 'n nuwe rekord te skep en te stoor
#       - DELETE Metodes om 'n spesifieke gestoorde rekord te verwyder
#       - PUT Metodes om 'n spesifieke rekord te wysig

@app.get('/')
def root():
    return {'message': 'API'}

# ==================== AUTH ====================
#Gebruik salt om selfde passwords van ander users unique te maak
#Eenrigting hash nie encryption nie
#Passwords bestaan uit 60 karakters
#   Identifier -> bcrypt weergawe -> "$2b$"
#   Koste faktoor -> 12 -> "12$"
#   Sout (salt) -> 128-bits ewekansige sout (salt) unieke vir elke wagwoord al is dit presies dieselfde wagwoord (Base64 formaat) -> 22 karakters lang string
#   Hash payload -> 192-bits vingerprint gebruik Eksblowfish om die wagwoord en 'n sout saam te skommel (2^kostefaktoor) = 4096 keer (Base64 formaat) -> 31 karakters lang string

#Base64 bcrypt formaat
#   Groupeer bits in blokke van 6 bits
#   Elke bit is 'n waarde van 0-63 -> elke waarde map na 'n karakter
#   Vir die sout is die 128bits / 6 = 21.33 karakters -> sisteem round op na 22 karakters en vul die laaste 4 bits met padding
#   Gebruik A-Z, a-z, 0-9, ., / vir karakters
#   Gebruik 0'e vir padding

def encrypt_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    #bcrypt 
    #   -> Kry sout, koste faktoor van die hashed password
    #   -> Gebruik dit dan om die ander password te hash
    #   -> Die resultaat word met mekaar dan vergelyk en gee [true|false]
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

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

@app.get('/users/mergesort/{field}/{sort_order}/{steps}')
def get_users_merge_sort(field : str, sort_order : bool, steps : int):
    conn = get_db()
    
    try:
        cursor = conn.cursor()
        data = cursor.execute('SELECT * FROM app_user WHERE is_admin = false').fetchall()
        is_sorted = True
        compare = []

        columns = cursor.execute("PRAGMA table_info(app_user)").fetchall()
        field_names = [column[1] for column in columns]

        if field not in field_names or field in ("is_admin", "user_id"):
            raise HTTPException(status_code=400, detail='Field is invalid')

        if steps < -1:
            raise HTTPException(status_code=400, detail='Invalid steps')

        def merge(left : list, right : list) -> list:
            nonlocal steps, is_sorted, compare
            result = []
            left_index = 0
            right_index = 0

            while (left_index < len(left)) and (right_index < len(right)):
                if steps == 0:
                    is_sorted = False
                    return result + left[left_index:] + right[right_index:]

                if steps > 0:
                    steps -= 1
                
                left_value = left[left_index][field]
                right_value = right[right_index][field]

                if isinstance(left_value, str):
                    left_value = left_value.lower()

                if isinstance(right_value, str):
                    right_value = right_value.lower()

                compare = [
                    left[left_index]["user_id"],
                    right[right_index]["user_id"]
                ]

                if sort_order:
                    if left_value <= right_value:
                        result.append(left[left_index])
                        left_index += 1
                    else:
                        result.append(right[right_index])
                        right_index += 1
                else:
                    if left_value >= right_value:
                        result.append(left[left_index])
                        left_index += 1
                    else:
                        result.append(right[right_index])
                        right_index += 1

            result.extend(left[left_index:])
            result.extend(right[right_index:])
            return result

        def merge_sort(mergedata : list) -> list:
            if(len(mergedata) <= 1):
                return mergedata

            splice = len(mergedata)//2
            left = mergedata[:splice]
            right = mergedata[splice:]

            left = merge_sort(left)
            right = merge_sort(right)

            return merge(left, right)

        sorted_users = merge_sort(data)
        
        return{
            "users" : sorted_users,
            "sorted" : is_sorted,
            "compare" : compare
        }
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.get('/users/mergesort/admin/{field}/{sort_order}/{steps}')
def get_users_merge_sort(field : str, sort_order : bool, steps : int):
    conn = get_db()
    
    try:
        cursor = conn.cursor()
        data = cursor.execute('SELECT * FROM app_user WHERE is_admin = true').fetchall()
        is_sorted = True
        compare = []

        columns = cursor.execute("PRAGMA table_info(app_user)").fetchall()
        field_names = [column[1] for column in columns]

        if field not in field_names or field in ("is_admin", "user_id"):
            raise HTTPException(status_code=400, detail='Field is invalid')

        if steps < -1:
            raise HTTPException(status_code=400, detail='Invalid steps')

        def merge(left : list, right : list) -> list:
            nonlocal steps, is_sorted, compare
            result = []
            left_index = 0
            right_index = 0

            while (left_index < len(left)) and (right_index < len(right)):
                if steps == 0:
                    is_sorted = False
                    return result + left[left_index:] + right[right_index:]

                if steps > 0:
                    steps -= 1
                
                left_value = left[left_index][field]
                right_value = right[right_index][field]

                if isinstance(left_value, str):
                    left_value = left_value.lower()

                if isinstance(right_value, str):
                    right_value = right_value.lower()

                compare = [
                    left[left_index]["user_id"],
                    right[right_index]["user_id"]
                ]

                if sort_order:
                    if left_value <= right_value:
                        result.append(left[left_index])
                        left_index += 1
                    else:
                        result.append(right[right_index])
                        right_index += 1
                else:
                    if left_value >= right_value:
                        result.append(left[left_index])
                        left_index += 1
                    else:
                        result.append(right[right_index])
                        right_index += 1

            result.extend(left[left_index:])
            result.extend(right[right_index:])
            return result

        def merge_sort(mergedata : list) -> list:
            if(len(mergedata) <= 1):
                return mergedata

            splice = len(mergedata)//2
            left = mergedata[:splice]
            right = mergedata[splice:]

            left = merge_sort(left)
            right = merge_sort(right)

            return merge(left, right)

        sorted_users = merge_sort(data)
        
        return{
            "users" : sorted_users,
            "sorted" : is_sorted,
            "compare" : compare
        }
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.get('/users/insertionsort/{field}/{sort_order}/{steps}')
def get_users_insertion_sort(field : str, sort_order : bool, steps : int):
    conn = get_db()
    
    try:
        cursor = conn.cursor()
        data = cursor.execute('SELECT * FROM app_user WHERE is_admin = false').fetchall()
        is_sorted = True
        compare = []

        columns = cursor.execute("PRAGMA table_info(app_user)").fetchall()
        field_names = [column[1] for column in columns]

        if field not in field_names or field in ("is_admin", "user_id"):
            raise HTTPException(status_code=400, detail='Field is invalid')

        if steps < -1:
            raise HTTPException(status_code=400, detail='Invalid steps')

        def insertion_sort(insertiondata : list) -> list:
            nonlocal steps, is_sorted, compare
            result = insertiondata.copy()
            right_index = 1

            while right_index < len(result):
                left_index = right_index - 1
                left_value = result[left_index][field]
                temp_field = result[right_index]
                temp_value = result[right_index][field]

                if isinstance(left_value, str):
                    left_value = left_value.lower()

                if isinstance(temp_value, str):
                    temp_value = temp_value.lower()

                if steps == 0:
                    is_sorted = False
                    return result
                
                if sort_order:
                    while left_index >= 0 and left_value > temp_value:
                        compare = [
                            temp_field["user_id"],
                            result[left_index]["user_id"]
                        ]
                        
                        result[left_index+1] = result[left_index]
                        result[left_index] = temp_field
                        left_index -= 1
                        left_value = result[left_index][field]

                        if isinstance(left_value, str):
                            left_value = left_value.lower()

                        if steps == 0:
                            is_sorted = False
                            return result
                        
                        if steps > 0:
                            steps -= 1
                else:
                    while left_index >= 0 and left_value < temp_value:
                        compare = [
                            temp_field["user_id"],
                            result[left_index]["user_id"]
                        ]
                        
                        result[left_index+1] = result[left_index]
                        result[left_index] = temp_field
                        left_index -= 1
                        left_value = result[left_index][field]

                        if isinstance(left_value, str):
                            left_value = left_value.lower()

                        if steps == 0:
                            is_sorted = False
                            return result
                        
                        if steps > 0:
                            steps -= 1

                result[left_index+1] = temp_field
                right_index += 1

            return result

        sorted_users = insertion_sort(data)
        
        return{
            "users" : sorted_users,
            "sorted" : is_sorted,
            "compare" : compare
        }
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.get('/users/insertionsort/admin/{field}/{sort_order}/{steps}')
def get_users_insertion_sort(field : str, sort_order : bool, steps : int):
    conn = get_db()
    
    try:
        cursor = conn.cursor()
        data = cursor.execute('SELECT * FROM app_user WHERE is_admin = true').fetchall()
        is_sorted = True
        compare = []

        columns = cursor.execute("PRAGMA table_info(app_user)").fetchall()
        field_names = [column[1] for column in columns]

        if field not in field_names or field in ("is_admin", "user_id"):
            raise HTTPException(status_code=400, detail='Field is invalid')

        if steps < -1:
            raise HTTPException(status_code=400, detail='Invalid steps')

        def insertion_sort(insertiondata : list) -> list:
            nonlocal steps, is_sorted, compare
            result = insertiondata.copy()
            right_index = 1

            while right_index < len(result):
                left_index = right_index - 1
                left_value = result[left_index][field]
                temp_field = result[right_index]
                temp_value = result[right_index][field]

                if isinstance(left_value, str):
                    left_value = left_value.lower()

                if isinstance(temp_value, str):
                    temp_value = temp_value.lower()

                if steps == 0:
                    is_sorted = False
                    return result
                
                if sort_order:
                    while left_index >= 0 and left_value > temp_value:
                        compare = [
                            temp_field["user_id"],
                            result[left_index]["user_id"]
                        ]
                        
                        result[left_index+1] = result[left_index]
                        result[left_index] = temp_field
                        left_index -= 1
                        left_value = result[left_index][field]

                        if isinstance(left_value, str):
                            left_value = left_value.lower()

                        if steps == 0:
                            is_sorted = False
                            return result
                        
                        if steps > 0:
                            steps -= 1
                else:
                    while left_index >= 0 and left_value < temp_value:
                        compare = [
                            temp_field["user_id"],
                            result[left_index]["user_id"]
                        ]
                        
                        result[left_index+1] = result[left_index]
                        result[left_index] = temp_field
                        left_index -= 1
                        left_value = result[left_index][field]

                        if isinstance(left_value, str):
                            left_value = left_value.lower()

                        if steps == 0:
                            is_sorted = False
                            return result
                        
                        if steps > 0:
                            steps -= 1

                result[left_index+1] = temp_field
                right_index += 1

            return result

        sorted_users = insertion_sort(data)
        
        return{
            "users" : sorted_users,
            "sorted" : is_sorted,
            "compare" : compare
        }
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.get('/users/heapsort/{field}/{sort_order}/{steps}')
def get_users_heap_sort(field : str, sort_order : bool, steps : int):
    conn = get_db()
    
    try:
        cursor = conn.cursor()
        data = cursor.execute('SELECT * FROM app_user WHERE is_admin = false').fetchall()
        is_sorted = True
        compare = []

        columns = cursor.execute("PRAGMA table_info(app_user)").fetchall()
        field_names = [column[1] for column in columns]

        if field not in field_names or field in ("is_admin", "user_id"):
            raise HTTPException(status_code=400, detail='Field is invalid')

        if steps < -1:
            raise HTTPException(status_code=400, detail='Invalid steps')

        def max_heapify(heapdata : list, index : int, size : int) -> list:
            nonlocal steps, is_sorted, compare
            result = heapdata.copy()
            left_index = (index*2) + 1
            right_index = (index*2) + 2

            parent_value = result[index][field]

            if isinstance(parent_value, str):
                parent_value = parent_value.lower()

            if steps == 0:
                is_sorted = False
                return result

            if right_index < size:
                left_value = result[left_index][field]
                right_value = result[right_index][field]

                if isinstance(left_value, str):
                    left_value = left_value.lower()

                if isinstance(right_value, str):
                    right_value = right_value.lower()

                if parent_value < max(left_value, right_value):
                    if left_value >= right_value:
                        compare = [
                            result[index]["user_id"],
                            result[left_index]["user_id"]
                        ]

                        temp = result[index]
                        result[index] = result[left_index]
                        result[left_index] = temp

                        if steps > 0:
                            steps -= 1

                        return max_heapify(result, left_index, size)
                    else:
                        compare = [
                            result[index]["user_id"],
                            result[right_index]["user_id"]
                        ]

                        temp = result[index]
                        result[index] = result[right_index]
                        result[right_index] = temp

                        if steps > 0:
                            steps -= 1

                        return max_heapify(result, right_index, size)

            elif left_index == size - 1:
                left_value = result[left_index][field]

                if isinstance(left_value, str):
                    left_value = left_value.lower()

                if parent_value < left_value:
                    compare = [
                        result[index]["user_id"],
                        result[left_index]["user_id"]
                    ]

                    temp = result[index]
                    result[index] = result[left_index]
                    result[left_index] = temp

                    if steps > 0:
                        steps -= 1

                    return result
            return result

        def min_heapify(heapdata : list, index : int, size : int) -> list:
            nonlocal steps, is_sorted, compare
            result = heapdata.copy()
            left_index = (index*2) + 1
            right_index = (index*2) + 2

            parent_value = result[index][field]

            if isinstance(parent_value, str):
                parent_value = parent_value.lower()

            if steps == 0:
                is_sorted = False
                return result

            if right_index < size:
                left_value = result[left_index][field]
                right_value = result[right_index][field]

                if isinstance(left_value, str):
                    left_value = left_value.lower()

                if isinstance(right_value, str):
                    right_value = right_value.lower()

                if parent_value > min(left_value, right_value):
                    if left_value <= right_value:
                        compare = [
                            result[index]["user_id"],
                            result[left_index]["user_id"]
                        ]

                        temp = result[index]
                        result[index] = result[left_index]
                        result[left_index] = temp

                        if steps > 0:
                            steps -= 1

                        return min_heapify(result, left_index, size)
                    else:
                        compare = [
                            result[index]["user_id"],
                            result[right_index]["user_id"]
                        ]

                        temp = result[index]
                        result[index] = result[right_index]
                        result[right_index] = temp

                        if steps > 0:
                            steps -= 1

                        return min_heapify(result, right_index, size)

            elif left_index == size - 1:
                left_value = result[left_index][field]

                if isinstance(left_value, str):
                    left_value = left_value.lower()

                if parent_value > left_value:
                    compare = [
                        result[index]["user_id"],
                        result[left_index]["user_id"]
                    ]

                    temp = result[index]
                    result[index] = result[left_index]
                    result[left_index] = temp

                    if steps > 0:
                        steps -= 1

                    return result
            return result

        def heap_sort(heapdata : list) -> list:
            nonlocal steps, is_sorted, compare
            result = heapdata.copy()

            for index in range((len(result)//2)-1, -1, -1):
                if steps == 0:
                    is_sorted = False
                    return result

                if sort_order:
                    result = max_heapify(result, index, len(result))
                else:
                    result = min_heapify(result, index, len(result))

            for index in range((len(result)-1),0,-1):
                if steps == 0:
                    is_sorted = False
                    return result

                compare = [
                    result[index]["user_id"],
                    result[0]["user_id"]
                ]
                
                temp = result[index]
                result[index] = result[0]
                result[0] = temp

                if steps > 0:
                    steps -= 1

                if sort_order:
                    result = max_heapify(result, 0, index)
                else:
                    result = min_heapify(result, 0, index)
            return result

        sorted_users = heap_sort(data)
        
        return{
            "users" : sorted_users,
            "sorted" : is_sorted,
            "compare" : compare
        }
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.get('/users/heapsort/admin/{field}/{sort_order}/{steps}')
def get_users_heap_sort(field : str, sort_order : bool, steps : int):
    conn = get_db()
    
    try:
        cursor = conn.cursor()
        data = cursor.execute('SELECT * FROM app_user WHERE is_admin = true').fetchall()
        is_sorted = True
        compare = []

        columns = cursor.execute("PRAGMA table_info(app_user)").fetchall()
        field_names = [column[1] for column in columns]

        if field not in field_names or field in ("is_admin", "user_id"):
            raise HTTPException(status_code=400, detail='Field is invalid')

        if steps < -1:
            raise HTTPException(status_code=400, detail='Invalid steps')

        def max_heapify(heapdata : list, index : int, size : int) -> list:
            nonlocal steps, is_sorted, compare
            result = heapdata.copy()
            left_index = (index*2) + 1
            right_index = (index*2) + 2

            parent_value = result[index][field]

            if isinstance(parent_value, str):
                parent_value = parent_value.lower()

            if steps == 0:
                is_sorted = False
                return result

            if right_index < size:
                left_value = result[left_index][field]
                right_value = result[right_index][field]

                if isinstance(left_value, str):
                    left_value = left_value.lower()

                if isinstance(right_value, str):
                    right_value = right_value.lower()

                if parent_value < max(left_value, right_value):
                    if left_value >= right_value:
                        compare = [
                            result[index]["user_id"],
                            result[left_index]["user_id"]
                        ]

                        temp = result[index]
                        result[index] = result[left_index]
                        result[left_index] = temp

                        if steps > 0:
                            steps -= 1

                        return max_heapify(result, left_index, size)
                    else:
                        compare = [
                            result[index]["user_id"],
                            result[right_index]["user_id"]
                        ]

                        temp = result[index]
                        result[index] = result[right_index]
                        result[right_index] = temp

                        if steps > 0:
                            steps -= 1

                        return max_heapify(result, right_index, size)

            elif left_index == size - 1:
                left_value = result[left_index][field]

                if isinstance(left_value, str):
                    left_value = left_value.lower()

                if parent_value < left_value:
                    compare = [
                        result[index]["user_id"],
                        result[left_index]["user_id"]
                    ]

                    temp = result[index]
                    result[index] = result[left_index]
                    result[left_index] = temp

                    if steps > 0:
                        steps -= 1

                    return result
            return result

        def min_heapify(heapdata : list, index : int, size : int) -> list:
            nonlocal steps, is_sorted, compare
            result = heapdata.copy()
            left_index = (index*2) + 1
            right_index = (index*2) + 2

            parent_value = result[index][field]

            if isinstance(parent_value, str):
                parent_value = parent_value.lower()

            if steps == 0:
                is_sorted = False
                return result

            if right_index < size:
                left_value = result[left_index][field]
                right_value = result[right_index][field]

                if isinstance(left_value, str):
                    left_value = left_value.lower()

                if isinstance(right_value, str):
                    right_value = right_value.lower()

                if parent_value > min(left_value, right_value):
                    if left_value <= right_value:
                        compare = [
                            result[index]["user_id"],
                            result[left_index]["user_id"]
                        ]

                        temp = result[index]
                        result[index] = result[left_index]
                        result[left_index] = temp

                        if steps > 0:
                            steps -= 1

                        return min_heapify(result, left_index, size)
                    else:
                        compare = [
                            result[index]["user_id"],
                            result[right_index]["user_id"]
                        ]

                        temp = result[index]
                        result[index] = result[right_index]
                        result[right_index] = temp

                        if steps > 0:
                            steps -= 1

                        return min_heapify(result, right_index, size)

            elif left_index == size - 1:
                left_value = result[left_index][field]

                if isinstance(left_value, str):
                    left_value = left_value.lower()

                if parent_value > left_value:
                    compare = [
                        result[index]["user_id"],
                        result[left_index]["user_id"]
                    ]

                    temp = result[index]
                    result[index] = result[left_index]
                    result[left_index] = temp

                    if steps > 0:
                        steps -= 1

                    return result
            return result

        def heap_sort(heapdata : list) -> list:
            nonlocal steps, is_sorted, compare
            result = heapdata.copy()

            for index in range((len(result)//2)-1, -1, -1):
                if steps == 0:
                    is_sorted = False
                    return result

                if sort_order:
                    result = max_heapify(result, index, len(result))
                else:
                    result = min_heapify(result, index, len(result))

            for index in range((len(result)-1),0,-1):
                if steps == 0:
                    is_sorted = False
                    return result

                compare = [
                    result[index]["user_id"],
                    result[0]["user_id"]
                ]
                
                temp = result[index]
                result[index] = result[0]
                result[0] = temp

                if steps > 0:
                    steps -= 1

                if sort_order:
                    result = max_heapify(result, 0, index)
                else:
                    result = min_heapify(result, 0, index)
            return result

        sorted_users = heap_sort(data)
        
        return{
            "users" : sorted_users,
            "sorted" : is_sorted,
            "compare" : compare
        }
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.get('/users/quicksort/{field}/{sort_order}/{steps}')
def get_users_quick_sort(field: str, sort_order: bool, steps: int):
    conn = get_db()

    try:
        cursor = conn.cursor()
        data = cursor.execute('SELECT * FROM app_user WHERE is_admin = false').fetchall()
        is_sorted = True
        compare = []
        columns = cursor.execute("PRAGMA table_info(app_user)").fetchall()

        field_names = [column[1] for column in columns]

        if field not in field_names or field in ("is_admin", "user_id"):
            raise HTTPException(status_code=400,detail='Field is invalid')

        if steps < -1:
            raise HTTPException(status_code=400,detail='Invalid steps')

        def quick_sort(quickdata: list) -> list:
            nonlocal steps, is_sorted, compare
            result = quickdata.copy()

            if len(result) <= 1:
                return result

            pivot = result[-1]
            pivot_value = pivot[field]

            if isinstance(pivot_value, str):
                pivot_value = pivot_value.lower()

            left = []
            right = []

            for index in range(len(result) - 1):
                current = result[index]
                current_value = current[field]

                if isinstance(current_value, str):
                    current_value = current_value.lower()

                compare = [current["user_id"],
                    pivot["user_id"]
                ]

                if steps == 0:
                    is_sorted = False

                    return (left + result[index:])

                if sort_order:
                    if current_value <= pivot_value:
                        left.append(current)
                    else:
                        right.append(current)
                else:
                    if current_value >= pivot_value:
                        left.append(current)
                    else:
                        right.append(current)

                if steps > 0:
                    steps -= 1

                if steps == 0:
                    is_sorted = False
                    remaining = result[index + 1:]

                    return (left + right+ remaining)

            if sort_order:
                result = (quick_sort(left) + [pivot] + quick_sort(right))
            else:
                result = (quick_sort(left) + [pivot] + quick_sort(right))

            return result

        if steps == 0:
            return {
                "users": data,
                "sorted": False,
                "compare": []
            }

        sorted_users = quick_sort(data)

        return {
            "users": sorted_users,
            "sorted": is_sorted,
            "compare": compare
        }
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=400,detail='Something went wrong')
    finally:
        conn.close()

@app.get('/users/quicksort/admin/{field}/{sort_order}/{steps}')
def get_users_quick_sort(field: str, sort_order: bool, steps: int):
    conn = get_db()

    try:
        cursor = conn.cursor()
        data = cursor.execute('SELECT * FROM app_user WHERE is_admin = true').fetchall()
        is_sorted = True
        compare = []
        columns = cursor.execute("PRAGMA table_info(app_user)").fetchall()

        field_names = [column[1] for column in columns]

        if field not in field_names or field in ("is_admin", "user_id"):
            raise HTTPException(status_code=400,detail='Field is invalid')

        if steps < -1:
            raise HTTPException(status_code=400,detail='Invalid steps')

        def quick_sort(quickdata: list) -> list:
            nonlocal steps, is_sorted, compare
            result = quickdata.copy()

            if len(result) <= 1:
                return result

            pivot = result[-1]
            pivot_value = pivot[field]

            if isinstance(pivot_value, str):
                pivot_value = pivot_value.lower()

            left = []
            right = []

            for index in range(len(result) - 1):
                current = result[index]
                current_value = current[field]

                if isinstance(current_value, str):
                    current_value = current_value.lower()

                compare = [current["user_id"],
                    pivot["user_id"]
                ]

                if steps == 0:
                    is_sorted = False

                    return (left + result[index:])

                if sort_order:
                    if current_value <= pivot_value:
                        left.append(current)
                    else:
                        right.append(current)
                else:
                    if current_value >= pivot_value:
                        left.append(current)
                    else:
                        right.append(current)

                if steps > 0:
                    steps -= 1

                if steps == 0:
                    is_sorted = False
                    remaining = result[index + 1:]

                    return (left + right+ remaining)

            if sort_order:
                result = (quick_sort(left) + [pivot] + quick_sort(right))
            else:
                result = (quick_sort(left) + [pivot] + quick_sort(right))

            return result

        if steps == 0:
            return {
                "users": data,
                "sorted": False,
                "compare": []
            }

        sorted_users = quick_sort(data)

        return {
            "users": sorted_users,
            "sorted": is_sorted,
            "compare": compare
        }
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=400,detail='Something went wrong')
    finally:
        conn.close()

@app.get('/users/bubblesort/{field}/{sort_order}/{steps}')
def get_users_bubble_sort(field: str, sort_order: bool, steps: int):
    conn = get_db()

    try:
        cursor = conn.cursor()
        data = cursor.execute('SELECT * FROM app_user WHERE is_admin = false').fetchall()
        is_sorted = True
        compare = []
        columns = cursor.execute("PRAGMA table_info(app_user)").fetchall()

        field_names = [column[1] for column in columns]

        if field not in field_names or field in ("is_admin", "user_id"):
            raise HTTPException(status_code=400,detail='Field is invalid')

        if steps < -1:
            raise HTTPException(status_code=400,detail='Invalid steps')

        def bubble_sort(bubbledata: list) -> list:
            nonlocal steps, is_sorted, compare
            result = bubbledata.copy()

            if steps == 0:
                is_sorted = False
                return result

            for right_index in range(len(result)-1):
                for left_index in range(len(result)-right_index-1):

                    compare = [
                        result[left_index]["user_id"],
                        result[left_index+1]["user_id"]
                    ]     

                    if sort_order:
                        if result[left_index+1][field] < result[left_index][field]:
                            temp = result[left_index]
                            result[left_index] = result[left_index+1]
                            result[left_index+1] = temp

                            if steps > 0:
                                steps -= 1

                            if steps == 0:
                                is_sorted = False
                                return result                        
                    else:
                        if result[left_index][field] < result[left_index+1][field]:
                            temp = result[left_index]
                            result[left_index] = result[left_index+1]
                            result[left_index+1] = temp

                            if steps > 0:
                                steps -= 1

                            if steps == 0:
                                is_sorted = False
                                return result
            return result

        sorted_users = bubble_sort(data)

        return{
            "users": sorted_users,
            "sorted": is_sorted,
            "compare": compare
        }
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=400,detail='Something went wrong')
    finally:
        conn.close()

@app.get('/users/bubblesort/admin/{field}/{sort_order}/{steps}')
def get_users_bubble_sort(field: str, sort_order: bool, steps: int):
    conn = get_db()

    try:
        cursor = conn.cursor()
        data = cursor.execute('SELECT * FROM app_user WHERE is_admin = true').fetchall()
        is_sorted = True
        compare = []
        columns = cursor.execute("PRAGMA table_info(app_user)").fetchall()

        field_names = [column[1] for column in columns]

        if field not in field_names or field in ("is_admin", "user_id"):
            raise HTTPException(status_code=400,detail='Field is invalid')

        if steps < -1:
            raise HTTPException(status_code=400,detail='Invalid steps')

        def bubble_sort(bubbledata: list) -> list:
            nonlocal steps, is_sorted, compare
            result = bubbledata.copy()

            if steps == 0:
                is_sorted = False
                return result

            for right_index in range(len(result)-1):
                for left_index in range(len(result)-right_index-1):

                    compare = [
                        result[left_index]["user_id"],
                        result[left_index+1]["user_id"]
                    ]     

                    if sort_order:
                        if result[left_index+1][field] < result[left_index][field]:
                            temp = result[left_index]
                            result[left_index] = result[left_index+1]
                            result[left_index+1] = temp

                            if steps > 0:
                                steps -= 1

                            if steps == 0:
                                is_sorted = False
                                return result                        
                    else:
                        if result[left_index][field] < result[left_index+1][field]:
                            temp = result[left_index]
                            result[left_index] = result[left_index+1]
                            result[left_index+1] = temp

                            if steps > 0:
                                steps -= 1

                            if steps == 0:
                                is_sorted = False
                                return result
            return result

        sorted_users = bubble_sort(data)

        return{
            "users": sorted_users,
            "sorted": is_sorted,
            "compare": compare
        }
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=400,detail='Something went wrong')
    finally:
        conn.close()

#Gebruikers se informasie word in twee verdeel
#   User (app_user) -> naam, van, epos, is_admin
#   Auth (auth) -> wagwoord, epos
@app.post('/user')
def create_user(user : UserCreate, auth : Auth):
    conn = get_db()
    try:
        cursor = conn.cursor()

        with ThreadPoolExecutor() as executor:
            #Auth
            #Hash die password voor hy in die databasis gestoor word
            hash_future = executor.submit(encrypt_password, auth.password)
            
            #User
            cursor.execute('INSERT INTO app_user (fname, sname, email, is_admin) VALUES (?, ?, ?, 0)',
            (user.fname, user.sname, user.email))
            user_id = cursor.lastrowid

            #Join Auth se resultaat nadat User se resultaat geproseseer het
            hashed_password = hash_future.result()

        cursor.execute('INSERT INTO auth (user_id, password, email) VALUES (?, ?, ?)',
        (user_id, hashed_password, user.email))
        
        conn.commit()
        return User(user_id=user_id, **user.model_dump())
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Email already exists')
    finally:
        conn.close()

#Vir admins wat ander admin accounts kan maak
#Presies dieselfde as normale post, maar kan ook is_admin stel
@app.post('/user/admin') 
def create_user(user : AdminUserCreate, auth : Auth): 
    conn = get_db()
    try:
        cursor = conn.cursor()

        with ThreadPoolExecutor() as executor:
            #Auth
            hash_future = executor.submit(encrypt_password, auth.password)

        
            #User
            cursor.execute('INSERT INTO app_user (fname, sname, email, is_admin) VALUES (?, ?, ?, ?)',
            (user.fname, user.sname, user.email, user.is_admin))
            user_id = cursor.lastrowid

            #Join Auth
            hashed_password = hash_future.result()
        
        cursor.execute('INSERT INTO auth (user_id, password, email) VALUES (?, ?, ?)',
        (user_id, hashed_password, user.email))
        
        conn.commit()
        return User(user_id=user_id, **user.model_dump()) 
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Email already exists')
    finally:
        conn.close()

#Werwag 'n regte wagwoord dan stuur dit 'n User objek 
#Gebruik epos om die user te identifiseer -> epos is unique per gebruiker
#Omdat HandleLogin op LogIn.jsx 'n user objek verwag was 'n nuwe model geskep
@app.post('/user/login')
def login(login : Login):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT password FROM auth WHERE email = ?', (login.email,))
        row = cursor.fetchone()

        with ThreadPoolExecutor() as executor:
            verify_future = executor.submit(verify_password, login.password, row[0])

            if row is None:
                raise HTTPException(status_code=401, detail='Wrong password')

            is_valid = verify_future.result()

        if is_valid:
            data = cursor.execute('SELECT * FROM app_user WHERE email = ?', (login.email,)).fetchone()
            return User(**dict(data))
        else:
            raise HTTPException(status_code=401, detail='Wrong password')
        
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
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/user/{user_id}')
def update_user(user_id : int, user : UserBase, is_admin : bool):
    if user_id <= 0:
        raise HTTPException(status_code=400, detail='User id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('UPDATE app_user SET fname = ?, sname = ?, email = ?, is_admin = ? WHERE user_id = ?',
        (user.fname, user.sname, user.email, is_admin, user_id)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='User does not exist')
        
        conn.commit()
        
        return {'message': f'User {user_id} has been updated'}

    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

# ==================== TIMETABLE ==================== 
@app.get('/timetable/{timetable_id}')
def get_timetable(timetable_id : int):
    if timetable_id <= 0:
        raise HTTPException(status_code=400, detail='Timetable id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('SELECT * FROM timetable WHERE timetable_id = ?', (timetable_id,)).fetchone()
        if not data:
            raise HTTPException(status_code=404, detail='Timetable does not exist')
        
        return Timetable(**dict(data))

    finally:
        conn.close()

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

@app.post('/timetable') # ****COMEBACK TO THIS FUNCTION FOR REFACTORING MAYBE
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
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.delete('/timetable/{timetable_id}')
def delete_timetable(timetable_id : int):
    if timetable_id <= 0:
        raise HTTPException(status_code=400, detail='Timetable id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM timetable WHERE timetable_id = ?', (timetable_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Timetable does not exist')
        
        conn.commit()
        
        return {'message': f'Timetable {timetable_id} has been deleted'}
        
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/timetable/{timetable_id}')
def update_timetable(timetable_id : int, timetable : TimetableBase):
    if timetable_id <= 0:
        raise HTTPException(status_code=400, detail='Timetable id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('UPDATE timetable SET venue_id = ?, day_of_week = ?, start_time = ?, end_time = ?, module_code = ?, semester_start = ?, semester_end = ? WHERE timetable_id = ?',
        (
            timetable.venue_id, 
            timetable.day_of_week, 
            timetable.start_time, 
            timetable.end_time, 
            timetable.module_code, 
            timetable.semester_start, 
            timetable.semester_end, 
            timetable_id
        )
        )

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Timetable does not exist') 
        
        conn.commit()

        return {'message': f'Timetable {timetable_id} has been updated'}
        
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

# ==================== MODULE ====================
@app.get('/modules')
def get_modules():
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM module').fetchall()
    modules = [dict(d) for d in data]

    conn.close()

    return modules

# ==================== BOOKING ====================
@app.get('/booking/{booking_id}')
def get_booking(booking_id : int):
    if booking_id <= 0:
        raise HTTPException(status_code=400, detail='Booking id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('SELECT * FROM booking WHERE booking_id = ?', (booking_id,)).fetchone()
        if not data:
            raise HTTPException(status_code=404, detail='Booking does not exist')
        
        return Booking(**dict(data))
    
    finally:
        conn.close()

@app.get('/booking/by-venue/{venue_id}')
def get_booking(venue_id : int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute('SELECT * FROM booking WHERE venue_id = ?', (venue_id,)).fetchall()
    bookings = [Booking(**dict(d)) for d in data]

    conn.close()

    return bookings

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
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.delete('/booking/{booking_id}')
def delete_booking(booking_id : int):
    if booking_id <= 0:
        raise HTTPException(status_code=400, detail='Booking id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM booking WHERE booking_id = ?', (booking_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Booking does not exist')
        
        conn.commit()
    
        return {'message': f'Booking {booking_id} has been deleted'}
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/booking/{booking_id}')
def update_booking(booking_id : int, booking : BookingBase):
    if booking_id <= 0:
        raise HTTPException(status_code=400, detail='Booking id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute(
            'UPDATE booking SET venue_id = ?, user_id = ?, start_time = ?, end_time = ?, booking_date = ? WHERE booking_id = ?',
            (
                booking.venue_id,
                booking.user_id,
                booking.start_time.isoformat(),
                booking.end_time.isoformat(),
                booking.booking_date.isoformat(),
                booking_id
            )
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Booking does not exist')
        
        conn.commit()
        
        return {'message': f'Booking {booking_id} has been updated'}

    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

# Kyk vir botsings met nuwe Admin booking (gee true of false terug :))
@app.get('/booking/check-conflict/{venue_id}')
def check_conflict(venue_id: int, booking_date: str, start_time: str, end_time: str):
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute(
            '''SELECT * FROM booking 
               WHERE venue_id = ? 
               AND booking_date = ?
               AND NOT (end_time <= ? OR start_time >= ?)''',
            (venue_id, booking_date, start_time, end_time)
        ).fetchall()

        if not data:
            return {"conflict": False}

        bookings = [Booking(**dict(d)) for d in data]
        return {"conflict": True, "bookings": bookings}

    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

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
        conn.rollback()
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
        conn.rollback()
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
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()
        
# ==================== CAMPUS MAP ====================
@app.get('/campus-map/{campus_id}')
def get_campus_map(campus_id : int):
    if campus_id <= 0:
        raise HTTPException(status_code=400, detail='Campus id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('SELECT * FROM campus_map WHERE campus_id = ?', (campus_id,)).fetchone()
        if not data:
            raise HTTPException(status_code=404, detail='Campus map does not exist')
        
        return CampusMap(**dict(data))

    finally:
        conn.close()
    
# ==================== BUILDING ====================
@app.get('/buildings/by-campus/{campus_id}')
def get_buildings(campus_id : int):
    conn = get_db()
    
    cursor = conn.cursor()
    
    data = cursor.execute('SELECT * FROM building WHERE campus_id = ?', (campus_id,)).fetchall()
    buildings = [Building(**dict(d)) for d in data] 
    
    conn.close()
    
    return buildings

@app.get('/building/{building_id}')
def get_building(building_id : int):
    if building_id <= 0:
        raise HTTPException(status_code=400, detail='Building id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('SELECT * FROM building WHERE building_id = ?', (building_id,)).fetchone()
        if not data:
            raise HTTPException(status_code=404, detail='Building does not exist')
        
        return Building(**dict(data))
    
    finally:
        conn.close()

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

        cursor.execute('INSERT INTO building (campus_id, building_name) VALUES (?, ?)',
        (building.campus_id, building.building_name))
        
        conn.commit()
        
        return Building(building_id=cursor.lastrowid, **building.model_dump())

    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.delete('/building/{building_id}')
def delete_building(building_id : int):
    if building_id <= 0:
        raise HTTPException(status_code=400, detail='Building id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM building WHERE building_id = ?', (building_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Building does not exist')
        
        conn.commit()
        
        return {'message': f'Building {building_id} has been deleted'}
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/building/{building_id}')
def update_building(building_id : int, building : BuildingBase):
    if building_id <= 0:
        raise HTTPException(status_code=400, detail='Building id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        cursor.execute('UPDATE building SET campus_id = ?, building_name = ? WHERE building_id = ?',
        (building.campus_id, building.building_name, building_id)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Building does not exist')
        
        conn.commit()

        return {'message': f'Building {building_id} has been updated'}
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()
        
# ==================== BUILDING MAP ====================
@app.get('/building-map/{campus_id}-{building_id}-{floor}')
def get_building_map(campus_id : int, building_id : int, floor : int):
    if campus_id <= 0:
        raise HTTPException(status_code=400, detail='Campus id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('''
            SELECT bm.*
            FROM building_map bm
            JOIN building b
            ON bm.building_id = b.building_id
            WHERE b.campus_id = ? 
            AND bm.building_id = ?
            AND bm.floor = ?
        ''', (campus_id, building_id, floor)).fetchone()
        if not data:
            raise HTTPException(status_code=404, detail='Building map does not exist')
        
        return BuildingMap(**dict(data))

    finally:
        conn.close()

# ==================== VENUE ====================
@app.get('/venue/{venue_id}')
def get_venue(venue_id : int):
    if venue_id <= 0:
        raise HTTPException(status_code=400, detail='Venue id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute('SELECT * FROM venue WHERE venue_id = ?', (venue_id,)).fetchone()
        if not data:
            raise HTTPException(status_code=404, detail='Venue does not exist')
        
        return Venue(**dict(data))

    finally:
        conn.close()

@app.get('/venue/{venue_id}/capacity')
def get_venue_capacity(venue_id: int):
    if venue_id <= 0:
        raise HTTPException(status_code=400, detail='Venue id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()

        data = cursor.execute(
            'SELECT capacity FROM venue WHERE venue_id = ?',
            (venue_id,)
        ).fetchone()

        if not data:
            raise HTTPException(status_code=404, detail='Venue does not exist')
        
        return {'capacity': data['capacity']}

    finally:
        conn.close()

@app.get('/venue/by-campus/{campus_id}')
def get_venue(campus_id : int):
    _map_cache.get_graph(campus_id)
    
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

        cursor.execute('INSERT INTO venue (building_id, venue_name, capacity, floor) VALUES (?, ?, ?, ?)',
        (venue.building_id, venue.venue_name, venue.capacity, venue.floor))
        
        conn.commit()
        
        return Venue(venue_id=cursor.lastrowid, **venue.model_dump())
        
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.delete('/venue/{venue_id}')
def delete_venue(venue_id : int):
    if venue_id <= 0:
        raise HTTPException(status_code=400, detail='Venue id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM venue WHERE venue_id = ?', (venue_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Venue does not exist')
        
        conn.commit()
        
        return {'message': f'Venue {venue_id} has been deleted'}

    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.put('/venue/{venue_id}')
def update_venue(venue_id : int, venue : VenueBase):
    if venue_id <= 0:
        raise HTTPException(status_code=400, detail='Venue id needs to be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute('UPDATE venue SET building_id = ?, venue_name = ?, capacity = ?, floor = ? WHERE venue_id = ?',
        (venue.building_id, venue.venue_name, venue.capacity, venue.floor, venue_id)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Venue does not exist')
        
        conn.commit()
    
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail='Something went wrong')
    finally:
        conn.close()

@app.get('/venues/by-building/{building_id}')
def get_venues_by_building(building_id: int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute(
        'SELECT * FROM venue WHERE building_id = ?',
        (building_id,)
    ).fetchall()

    venues = [Venue(**dict(d)) for d in data]

    conn.close()

    return venues

# ==================== EQUIPMENT ====================
@app.get('/equipment/by-venue_id/{venue_id}')
def get_equipment_by_venue(venue_id: int):
    conn = get_db()
    cursor = conn.cursor()

    data = cursor.execute(
        'SELECT * FROM equipment WHERE venue_id = ?',
        (venue_id,)
    ).fetchall()

    equipment = [dict(d) for d in data]

    conn.close()

    return equipment

@app.post('/equipment')
def create_equipment(equipment: EquipmentCreate):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO equipment (venue_id, equip_name, equip_qty) VALUES (?, ?, ?)',
            (equipment.venue_id, equipment.equip_name, equipment.equip_qty)
        )
        conn.commit()
        return dict(equip_id=cursor.lastrowid, **equipment.model_dump())
    except IntegrityError:
        raise HTTPException(status_code=400, detail='Something went wrong while adding equipment')
    finally:
        conn.close()

@app.delete('/equipment/{equip_id}')
def delete_equipment(equip_id: int):
    if equip_id <= 0:
        raise HTTPException(status_code=400, detail='Equipment id must be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM equipment WHERE equip_id = ?', (equip_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Equipment does not exist')
        
        conn.commit()
        return {'message': f'Equipment {equip_id} has been deleted'}
    except IntegrityError:
        raise HTTPException(status_code=400, detail='Something went wrong while deleting equipment')
    finally:
        conn.close()

@app.put('/equipment/{equip_id}')
def update_equipment(equip_id: int, equipment: EquipmentBase):
    if equip_id <= 0:
        raise HTTPException(status_code=400, detail='Equipment id must be greater than 0')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE equipment SET venue_id = ?, equip_name = ?, equip_qty = ? WHERE equip_id = ?',
            (equipment.venue_id, equipment.equip_name, equipment.equip_qty, equip_id)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Equipment does not exist')
        
        conn.commit()
        return {'message': f'Equipment {equip_id} has been updated'}
    except IntegrityError:
        raise HTTPException(status_code=400, detail='Something went wrong while updating equipment')
    finally:
        conn.close()

# ==================== ROUTE ====================
# Soos in models.py breek ROUTE weg van die konvensie van alle ander modelle en CRUD metodes

# Hier is waar al die roete se data gebou word in so manier dat ons kan navigeer op die kaart op menigde vlakke (kampus-en gebou-vlak)
# Hierdie funksie toets om te bepaal in watse konteks die huidige deel van die roete voorkom deur die data wat ons binne vertices het. Dit return vir ons 'n Tuple wat in Python
# gebruik kan word om logiese toetse uit te voer binne get_route().
def vertex_context(vertex):
    if vertex['level'] == 'campus':
        return (vertex['level'], vertex['campus_id'])
    else:
        return (vertex['level'], vertex['building_id'], vertex['floor'])
    
# Die enigste verskil tussen vertex_context() en build_context() is wat hulle elkeen return. Waar vertex_context() 'n Tuple vir ons return wat ons gebruik om te vergelyk binne watse context ons is,
# return build_context() return 'n Dict met die eintlike data wat ons soek om die path_route te bou
def build_context(vertex):
    if vertex['level'] == 'campus':
        return {
            'level': vertex['level'], 
            'campus_id': vertex['campus_id']
        }
    else:
        return {
            'level': vertex['level'], 
            'building_id': vertex['building_id'], 
            'floor': vertex['floor']
        }

# Hierdie is die funkise wat geroep word om die roete te bou en terug te stuur vir navigasie.
# Die gebruiker sal stuur in watse lokaal hulle wil begin en in watse lokaal hulle wil eindig. Met dit gaan kyk ons of daardie lokale vertices het binne die databasis.
@app.get('/route/{campus_id}-{start_venue}-{destination_venue}')
def get_route(campus_id : int, start_venue : int, destination_venue : int):
    if campus_id <= 0:
        raise HTTPException(status_code=400, detail='Campus id needs to be greater than 0')

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT ven.venue_id, v.vertex_id
        FROM venue ven
        JOIN vertex v ON v.venue_id = ven.venue_id AND v.level = 'building'
        WHERE ven.venue_id IN (?, ?)
    ''', (start_venue, destination_venue))

    rows = {row['venue_id']: row['vertex_id'] for row in cursor.fetchall()}
    conn.close()

    if start_venue not in rows or destination_venue not in rows:
        raise HTTPException(status_code=404, detail='One or both venues could not be resolved to a location')

    start_from = rows[start_venue]
    destination = rows[destination_venue]
    
    # Hier is waar ons die roete probeer bou
    # Die logika loop deur die pad wat ons dijkstra algoritme en gebruik die vertex_ids wat gestoor is binne hom.
    # Dan stoor ons die context Tuple binne key wat gebruik word om te toets of ons nog binne dieselfde konteks van die roete werk of nie.
    # As ons in 'n nuwe konteks is dan append ons dit aan group sodat ons al die dele van die roete opbreek volgend vlak en vloer nommer.
    try:
        adjacency, vertices = _map_cache.get_graph(campus_id)
        path_data, distance_data = dijkstra(adjacency, vertices, start_from, destination)
        
        groups = []
        current_group = None
        previous_key = None

        for vertex_id in path_data:
            vertex = vertices[vertex_id]
            key = vertex_context(vertex)

            if key != previous_key:
                current_group = {'context': build_context(vertex), 'coordinates': []}
                groups.append(current_group)
                
            current_group['coordinates'].append(
                [vertex['latitude'], vertex['longitude']]
            )
            previous_key = key
        
        
        return Route(path_data=groups, distance=distance_data)
    
    except Exception:
        raise HTTPException(status_code=400, detail='Route could not be determined')
