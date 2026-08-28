/**
 * ============================================================
 * NSTU Bus Tracker - Route Calculator JavaScript Service
 * ============================================================
 * This service connects the React frontend to the C++ Dijkstra
 * route calculator through the PHP API gateway.
 *
 * Chain: React Component → routeCalculatorJS (this file)
 *          → PHP Gateway → C++ Binary (Dijkstra Algorithm)
 *
 * Technology Stack Used:
 *   ✅ HTML5         - index.html (entry point, SEO meta tags)
 *   ✅ JavaScript    - This file + React frontend (src/)
 *   ✅ C++           - api/cpp/route_calculator.cpp (algorithm)
 *   ✅ PHP           - api/cpp/route_calculator.php (bridge)
 *   ✅ MySQL         - api/database.sql (data storage)
 * ============================================================
 */

const CPP_API_BASE = 'http://localhost/NSTU-BUS-TRACKER/api/cpp';

// -------------------------------------------------------
// NSTU Campus Bus Stop Registry (matches C++ node list)
// -------------------------------------------------------
export const NSTU_BUS_STOPS = [
  { id: 0,  name: 'NSTU Main Gate',     area: 'Sonapur',     route: 'A', lat: 22.7925, lng: 91.1002 },
  { id: 1,  name: 'Sonapur Bazar',      area: 'Sonapur',     route: 'A', lat: 22.8012, lng: 91.0987 },
  { id: 2,  name: 'Companiganj',        area: 'Companiganj', route: 'A', lat: 22.8157, lng: 91.0934 },
  { id: 3,  name: 'Bashbaria',          area: 'Bashbaria',   route: 'A', lat: 22.8287, lng: 91.0912 },
  { id: 4,  name: 'Maijdee Court',      area: 'Maijdee',     route: 'A', lat: 22.8491, lng: 91.0978 },
  { id: 5,  name: 'NSTU Campus Gate',   area: 'Sonapur',     route: 'B', lat: 22.7918, lng: 91.1015 },
  { id: 6,  name: 'Begumganj Turn',     area: 'Begumganj',   route: 'B', lat: 22.8074, lng: 91.1122 },
  { id: 7,  name: 'Jamidar Hat',        area: 'Begumganj',   route: 'B', lat: 22.8243, lng: 91.1198 },
  { id: 8,  name: 'Chowmuhani Square',  area: 'Chowmuhani',  route: 'B', lat: 22.8512, lng: 91.1234 },
  { id: 9,  name: 'Admin Building',     area: 'NSTU Campus', route: 'C', lat: 22.7931, lng: 91.1008 },
  { id: 10, name: 'Academic Block',     area: 'NSTU Campus', route: 'C', lat: 22.7942, lng: 91.1019 },
  { id: 11, name: 'Dormitory Gate',     area: 'NSTU Campus', route: 'C', lat: 22.7909, lng: 91.0995 },
];

// -------------------------------------------------------
// Route Calculator API Service
// -------------------------------------------------------

/**
 * Calculate the shortest route between two bus stops using
 * the C++ Dijkstra algorithm (via PHP gateway).
 *
 * @param {number} sourceId       - Source stop ID (0-11)
 * @param {number} destinationId  - Destination stop ID (0-11)
 * @returns {Promise<RouteResult>} - Shortest path result
 */
export async function calculateShortestRoute(sourceId, destinationId) {
  try {
    const response = await fetch(
      `${CPP_API_BASE}/route_calculator.php?source=${sourceId}&destination=${destinationId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.warn('C++ route calculator unavailable, using JS fallback.', error);
    // Fallback: Simple JS-based route calculation (BFS)
    return calculateRouteJSFallback(sourceId, destinationId);
  }
}

/**
 * Get all available bus stops
 * @returns {Array} - List of all bus stop objects
 */
export function getAllStops() {
  return NSTU_BUS_STOPS;
}

/**
 * Get stops filtered by bus route (A, B, or C)
 * @param {string} route - Route letter: 'A', 'B', or 'C'
 * @returns {Array} - Filtered stop list
 */
export function getStopsByRoute(route) {
  return NSTU_BUS_STOPS.filter(stop => stop.route === route);
}

/**
 * Find a stop by its ID
 * @param {number} id - Stop ID (0-11)
 * @returns {Object|null} - Stop object or null
 */
export function getStopById(id) {
  return NSTU_BUS_STOPS.find(stop => stop.id === id) || null;
}

// -------------------------------------------------------
// JavaScript Fallback Route Finder (BFS)
// Used when C++ binary is not available (e.g. during dev)
// -------------------------------------------------------

// Inline graph matching C++ adjacency list
const GRAPH_EDGES = [
  // Route A
  [0, 1, 1.2, 4], [1, 2, 2.1, 6], [2, 3, 1.8, 5], [3, 4, 2.4, 7],
  // Route B
  [5, 6, 1.5, 5], [6, 7, 2.0, 6], [7, 8, 2.8, 8],
  // Cross connections
  [0, 5, 0.2, 1], [1, 6, 1.0, 3], [4, 8, 0.8, 3],
  // Route C (Internal)
  [9, 10, 0.3, 2], [10, 11, 0.4, 2], [11, 0, 0.3, 2], [9, 0, 0.2, 1], [9, 5, 0.2, 1],
];

function buildJSGraph() {
  const graph = {};
  for (let i = 0; i < 12; i++) graph[i] = [];
  for (const [u, v, dist, time] of GRAPH_EDGES) {
    graph[u].push({ to: v, dist, time });
    graph[v].push({ to: u, dist, time }); // bidirectional
  }
  return graph;
}

function calculateRouteJSFallback(sourceId, destinationId) {
  const graph = buildJSGraph();
  const INF = Infinity;

  // Dijkstra in JavaScript
  const distances = Array(12).fill(INF);
  const times = Array(12).fill(INF);
  const prev = Array(12).fill(-1);
  const visited = Array(12).fill(false);

  distances[sourceId] = 0;
  times[sourceId] = 0;

  for (let i = 0; i < 12; i++) {
    // Pick unvisited node with minimum distance
    let u = -1;
    for (let j = 0; j < 12; j++) {
      if (!visited[j] && (u === -1 || distances[j] < distances[u])) u = j;
    }

    if (u === -1 || distances[u] === INF) break;
    visited[u] = true;

    for (const edge of graph[u]) {
      const newDist = distances[u] + edge.dist;
      if (newDist < distances[edge.to]) {
        distances[edge.to] = newDist;
        times[edge.to] = times[u] + edge.time;
        prev[edge.to] = u;
      }
    }
  }

  if (distances[destinationId] === INF) {
    return {
      success: false,
      error: 'No route found between selected stops',
      source: NSTU_BUS_STOPS[sourceId],
      destination: NSTU_BUS_STOPS[destinationId],
    };
  }

  // Reconstruct path
  const path = [];
  for (let v = destinationId; v !== -1; v = prev[v]) {
    path.unshift(NSTU_BUS_STOPS[v]);
  }

  return {
    success: true,
    source: NSTU_BUS_STOPS[sourceId],
    destination: NSTU_BUS_STOPS[destinationId],
    total_distance_km: parseFloat(distances[destinationId].toFixed(2)),
    total_time_minutes: times[destinationId],
    stop_count: path.length,
    path: path.map((stop, index) => ({ stop_order: index + 1, ...stop })),
    meta: {
      algorithm: "Dijkstra's (JavaScript Fallback)",
      language: 'JavaScript',
      note: 'C++ backend not available — using JS fallback',
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Format route result into a readable summary string
 * @param {Object} result - Route result from calculateShortestRoute()
 * @returns {string} - Formatted summary
 */
export function formatRouteSummary(result) {
  if (!result || !result.success) {
    return result?.error || 'Route calculation failed';
  }

  const stops = result.path.map(s => s.name).join(' → ');
  return `${stops} | ${result.total_distance_km} km | ~${result.total_time_minutes} min`;
}
