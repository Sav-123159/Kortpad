import heapq

def dijkstra(adjacency: dict, vertices: dict, start: int, end: int):
    if start not in vertices or end not in vertices:
        raise ValueError(f"start not in graph :'() )")

    dist = {start: 0}
    prev = {}
    visited = set()
    heap = [(0, start)]

    while heap:
        d, u = heapq.heappop(heap)

        if u in visited:
            continue
        visited.add(u)

        if u == end:
            break

        for v, weight in adjacency.get(u, []):
            if v in visited:
                continue
            new_dist = d + weight
            if new_dist < dist.get(v, float('inf')):
                dist[v] = new_dist
                prev[v] = u
                heapq.heappush(heap, (new_dist, v))

    if end not in dist:
        return None, float('inf')

    path = [end]
    while path[-1] != start:
        path.append(prev[path[-1]])
    path.reverse()

    return path, dist[end]
