#Gebruik 'n priority queue (min-heap)
import heapq

#Heap-based Djikstra
def dijkstra(adjacency: dict, vertices: dict, start: int, end: int):
    #Kyk of die begin vertices en einde vertices bestaan
    #As een of albei nie bestaan nie gooi 'n error
    if start not in vertices or end not in vertices:
        raise ValueError(f"Begin of einde hoekpunte is nie in grafiek nie")

    #Dictionary
    #Voorbeeld
    #   -> dist =
    #      {
    #           "A": 0,   -> vertex "A" se korste afstand is 0 (start)
    #           "B": 6,   -> vertex "B" se korste afstand is 6
    #           "C": 5   -> vertex "C" se korste afstand is 5
    #      }
    #Van start vertex na elke ander vertex
    #Hou die huidige korste afstande van alle vertices
    #Oorsronklik, stel afstand tussen start vertex en homself na 0
    dist = {start: 0}

    #Dictionary
    #Voorbeeld
    #   -> prev = 
    #      {
    #           "B": "A",   -> om B te bereik kom van A
    #           "C": "A",   -> om C te bereik kom van A
    #           "D": "C",   -> om D te bereik kom van C, wat dan van A af kom
    #           "E": "B"    -> om E te bereik kom van B, wat dan van A af kom
    #      }
    #Hou korste paaie vir elke vertex
    prev = {}

    #Set
    #Voorbeeld
    #   -> visited = {"A", "B", "C"}
    #Stoor vertices wat klaar geproseseer is
    visited = set()

    #Priority queue
    #Elke item (afstand, vertex)
    #Voorbeeld
    #   -> heap =
    #      [
    #           (4, "B"),   -> B is 4 weg van A
    #           (2, "C"),   -> C is 2 weg van A
    #           (7, "D")    -> D is 7 weg van A
    #      ]
    heap = [(0, start)]

    while heap:
        #Verwyder vertex met kleinste afstand van heap
        #Verdeel die afstand en vertex in d en u
        d, u = heapq.heappop(heap)

        #As die vertex klaar geprosesseer was, skip dit
        if u in visited:
            continue

        #Merk die vertex as geprosesseer
        visited.add(u)

        if u == end:
            break

        #Kyk na alle aangrensende vertices (v) aan heidige vertex (u)
        #Lee lys vir adjacency.get(u, []) as daar geen angrensende vertices (v) is aan die heidige vertex (u) nie
        for v, weight in adjacency.get(u, []):
            if v in visited:
                continue

            #Bereken afstand nuwe afstand vir v
            new_dist = d + weight

            #As die nuwe afstand na v korter is as 'n vorige afstand na v
            #   -> wysig die nuwe korste pad vir v
            #   -> stoor dat ons die kortste pad vir v van u af bereik het
            #   -> voeg op heap
            if new_dist < dist.get(v, float('inf')):
                dist[v] = new_dist
                prev[v] = u
                heapq.heappush(heap, (new_dist, v))

    #As daar geen waarde vir die einde destination vertex is nie
    #   -> bestaan dit nie
    #   -> dus is daar geen pad
    if end not in dist:
        return None, float('inf')

    #Begin by einde punt en werk terug met die prev-dictionary om die korste pad te kry
    path = [end]

    #Voeg vorige pad oor en oor tot die beginpunt
    while path[-1] != start:
        path.append(prev[path[-1]])

    #Draai lys om van begin te lees
    path.reverse()

    #Gee korste pad en totale afstand
    return path, dist[end]
