# Dijkstra Project Description

## Overview

This project implements **Dijkstra's Algorithm** for finding the shortest path in a weighted graph. Dijkstra's Algorithm is a classic solution in computer science for solving the single-source shortest path problem, where the goal is to determine the minimum distance from a starting node to all other nodes in a graph with non-negative edge weights.

## Features

- **Graph Representation:** Supports both adjacency list and adjacency matrix representations.
- **Customizable Input:** Users can define their own graphs and specify the source node.
- **Efficient Implementation:** Utilizes a priority queue (min-heap) for optimal performance.
- **Path Reconstruction:** Returns both the shortest distances and the actual paths taken.
- **Error Handling:** Handles disconnected graphs and invalid input gracefully.

## How It Works

1. **Initialization:**  
   All node distances are set to infinity except the source node, which is set to zero.

2. **Processing:**  
   The algorithm repeatedly selects the node with the smallest known distance, updates the distances to its neighbors, and continues until all nodes have been processed.

3. **Result:**  
   The shortest path from the source to every other node is computed and can be retrieved.

## Applications

- Network routing protocols (e.g., OSPF)
- GPS navigation systems
- Robotics and AI pathfinding
- Project scheduling and resource allocation

## Example Usage

```python
# Example usage in Python
graph = {
    'A': {'B': 1, 'C': 4},
    'B': {'C': 2, 'D': 5},
    'C': {'D': 1},
    'D': {}
}
distances, paths = dijkstra(graph, 'A')
print(distances)  # {'A': 0, 'B': 1, 'C': 3, 'D': 4}
print(paths)      # {'A': ['A'], 'B': ['A', 'B'], ...}
```

## References

- [Dijkstra's Algorithm - Wikipedia](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
- [Introduction to Algorithms, Cormen et al.]

---

*This project demonstrates a fundamental algorithm used in many real-world applications, emphasizing both correctness and efficiency.*