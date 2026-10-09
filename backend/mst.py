import heapq
from edmond_karp import load_campus_graph


def prim(campus_id : int):
    vertices, edges = load_campus_graph(campus_id, include_capacity=False)
    adjacency = {v: [] for v in vertices}
    for edge in edges:
        a, b, weight = edge['vertex_a'], edge['vertex_b'], edge['weight']
        adjacency[a].append((b, weight))
        adjacency[b].append((a, weight))

    visited = set()
    mst_edges = []
    # Elke nuwe beginpunt verwerk 'n los komponent van die grafiek.
    for start in vertices:
        if start in visited:
            continue
        heap = [(0, start, None)]
        while heap:
            weight, vertex, previous = heapq.heappop(heap)
            if vertex in visited:
                continue
            visited.add(vertex)
            if previous is not None:
                mst_edges.append((previous, vertex, weight))
            for neighbour, edge_weight in adjacency[vertex]:
                if neighbour not in visited:
                    heapq.heappush(heap, (edge_weight, neighbour, vertex))
    return mst_edges