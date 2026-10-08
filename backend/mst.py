import math
from database import get_db

def _distance(a, b):
    return math.dist((a['latitude'], a['longitude']), (b['latitude'], b['longitude']))

def prim(campus_id : int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT v.vertex_id, v.latitude, v.longitude
        FROM vertex v
        WHERE level = 'campus'
        AND campus_id = ?;          
    ''', (campus_id,))
    
    
    campus_vertices = {row['vertex_id']: dict(row) for row in cursor.fetchall()}
    conn.close()
    
    vertex_ids = list(campus_vertices.keys())
    
    if len(vertex_ids) < 2:
        return []

    start = vertex_ids[0]
    in_tree = {start}
    
    closest = {
        v: (_distance(campus_vertices[start], campus_vertices[v]), start)
        for v in vertex_ids if v != start
    }
    
    mst_edges = []
    
    while closest:
        next_vertex = min(closest, key=lambda v: closest[v][0])
        dist, from_vertex = closest.pop(next_vertex)
        
        mst_edges.append((from_vertex, next_vertex, dist))
        in_tree.add(next_vertex)
        
        for v in closest:
            d = _distance(campus_vertices[next_vertex], campus_vertices[v])
            if d < closest[v][0]:
                closest[v] = (d, next_vertex)
                
    return mst_edges
