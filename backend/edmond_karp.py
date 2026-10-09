from collections import deque
import math
from database import get_db


def load_campus_graph(campus_id : int, include_capacity : bool = True):
    # Laai vars data sodat kapasiteitsveranderings dadelik gebruik word.
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT campus_id FROM campus WHERE campus_id = ?', (campus_id,))
        if cursor.fetchone() is None:
            raise LookupError('Campus could not be found')
        cursor.execute("""
            SELECT vertex_id, latitude, longitude FROM vertex
            WHERE level = 'campus' AND campus_id = ? ORDER BY vertex_id
        """, (campus_id,))
        vertices = {row['vertex_id']: dict(row) for row in cursor.fetchall()}
        if include_capacity:
            cursor.execute('PRAGMA table_info(edge)')
            if 'capacity' not in {row['name'] for row in cursor.fetchall()}:
                raise ValueError('Add the capacity column to the edge table before calculating evacuation throughput')
        capacity_column = ', e.capacity' if include_capacity else ''
        cursor.execute(f"""
            SELECT e.edge_id, e.vertex_a, e.vertex_b, e.weight{capacity_column}
            FROM edge e
            JOIN vertex a ON a.vertex_id = e.vertex_a
            JOIN vertex b ON b.vertex_id = e.vertex_b
            WHERE a.level = 'campus' AND b.level = 'campus'
            AND a.campus_id = ? AND b.campus_id = ?
            ORDER BY e.edge_id
        """, (campus_id, campus_id))
        return vertices, [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


def edmond_karp(edges : list, vertices : dict, start : int, end : int):
    if start not in vertices or end not in vertices:
        raise ValueError('Begin or end vertex is not in the campus graph')
    if start == end:
        raise ValueError('Begin and end vertices must be different')

    residual = {v: {} for v in vertices}
    capacities = []
    for edge in edges:
        try:
            capacity = float(edge['capacity'])
        except (KeyError, TypeError, ValueError):
            raise ValueError(f"Edge {edge['edge_id']} needs a valid capacity")
        if not math.isfinite(capacity) or capacity < 0:
            raise ValueError(f"Edge {edge['edge_id']} needs a finite, non-negative capacity")
        a, b = edge['vertex_a'], edge['vertex_b']
        # Die tabel stoor ongerigte rande. Terugvloei kanselleer vorige vloei.
        residual[a][b] = residual[a].get(b, 0) + capacity
        residual[b][a] = residual[b].get(a, 0) + capacity
        capacities.append(capacity)

    max_flow = 0
    while True:
        parent = {start: None}
        queue = deque([start])
        # BFS vind die kortste aanvullende pad in die residuele grafiek.
        while queue and end not in parent:
            u = queue.popleft()
            for v, capacity in residual[u].items():
                if capacity > 0 and v not in parent:
                    parent[v] = u
                    queue.append(v)
        if end not in parent:
            break

        path_flow = float('inf')
        v = end
        while v != start:
            u = parent[v]
            path_flow = min(path_flow, residual[u][v])
            v = u
        v = end
        while v != start:
            u = parent[v]
            residual[u][v] -= path_flow
            residual[v][u] += path_flow
            v = u
        max_flow += path_flow

    flow_edges = []
    for edge, capacity in zip(edges, capacities):
        a, b = edge['vertex_a'], edge['vertex_b']
        flow = capacity - residual[a][b]
        # Positiewe vloei word altyd in sy werklike rigting teruggestuur.
        if flow < 0:
            a, b, flow = b, a, -flow
        flow_edges.append({
            'edge_id': edge['edge_id'], 'vertex_a': a, 'vertex_b': b,
            'capacity': capacity, 'flow': flow,
            'from': [vertices[a]['latitude'], vertices[a]['longitude']],
            'to': [vertices[b]['latitude'], vertices[b]['longitude']]
        })
    return max_flow, flow_edges
