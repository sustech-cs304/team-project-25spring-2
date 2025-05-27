import heapq

"""
Demonstrative Python file for a group algorithm project.
Implements Dijkstra's algorithm for finding the shortest path in a graph.
"""


def dijkstra(graph, start):
    """
    Finds the shortest paths from start node to all other nodes in the graph.
    :param graph: dict, adjacency list representation {node: [(neighbor, weight), ...]}
    :param start: starting node
    :return: dict, shortest distances to each node
    """
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    queue = [(0, start)]

    while queue:
        current_distance, current_node = heapq.heappop(queue)
        if current_distance > distances[current_node]:
            continue
        for neighbor, weight in graph[current_node]:
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(queue, (distance, neighbor))
    return distances

def main():
    # Example graph
    graph = {
        'A': [('B', 1), ('C', 4)],
        'B': [('A', 1), ('C', 2), ('D', 5)],
        'C': [('A', 4), ('B', 2), ('D', 1)],
        'D': [('B', 5), ('C', 1)]
    }
    start_node = 'A'
    print(f"Shortest distances from {start_node}:")
    distances = dijkstra(graph, start_node)
    for node, distance in distances.items():
        print(f"  {node}: {distance}")

if __name__ == "__main__":
    main()