from database import get_db

class GraphCache:
    def __init__(self):
        self._cache : dict[int, tuple[dict, dict]] = {}
        
    def get_graph(self, campus_id : int):
        if campus_id not in self._cache:
            self._cache[campus_id] = self._load_campus_graph(campus_id)
        return self._cache[campus_id]
    
    def _load_campus_graph(self, campus_id : int):
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT v.vertex_id
            FROM vertex v
            LEFT JOIN building b ON b.building_id = v.building_id
            WHERE v.campus_id = ? OR b.campus_id = ?
        ''', (campus_id, campus_id))
        
        campus_vertex_ids = {row['vertex_id'] for row in cursor.fetchall()}
        
        cursor.execute('SELECT from_vertex, to_vertex, weight FROM edge_adjacency')
        adjacency = {}
        for row in cursor.fetchall():
            if row['from_vertex'] in campus_vertex_ids and row['to_vertex'] in campus_vertex_ids:
                adjacency.setdefault(row['from_vertex'], []).append(
                    (row['to_vertex'], row['weight'])
                )
            
        cursor.execute('''
            SELECT v.vertex_id, v.level, v.campus_id, v.building_id, v.venue_id,
                   v.latitude, v.longitude
            FROM vertex AS v
            LEFT JOIN building AS b ON b.building_id = v.building_id
            WHERE v.campus_id = ? OR b.campus_id = ?
        ''', (campus_id, campus_id))
        
        vertices = {row['vertex_id']: dict(row) for row in cursor.fetchall()}
        
        conn.close()
        return adjacency, vertices
