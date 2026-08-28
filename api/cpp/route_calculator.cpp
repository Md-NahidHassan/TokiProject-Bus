/**
 * ============================================================
 * NSTU BUS TRACKER - Route Path Calculator (C++)
 * ============================================================
 * Algorithm   : Dijkstra's Shortest Path Algorithm
 * Purpose     : Calculate shortest route between bus stops on
 *               NSTU campus transport network
 * 
 * Usage (CLI): ./route_calculator <source_id> <destination_id>
 * Output     : JSON format with path, distance, estimated time
 * 
 * Technology Stack Note:
 *   Frontend  : HTML5 + JavaScript (React/Vite)
 *   Backend   : PHP + MySQL (XAMPP)
 *   Algorithm : C++ (This File) - Called via PHP exec()
 * ============================================================
 * Author: NSTU Transport System
 * ============================================================
 */

#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <limits>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

// -------------------------------------------------------
// Data Structures
// -------------------------------------------------------

struct Edge {
    int to;
    double distance_km;
    int time_minutes;
};

struct Node {
    int id;
    string name;
    string area;
    double lat;
    double lng;
};

// Priority queue node: {cost, vertex_id}
typedef pair<double, int> PQNode;

// Dijkstra result
struct RouteResult {
    bool found;
    vector<int> path;
    double total_distance_km;
    int total_time_minutes;
    string error;
};

// -------------------------------------------------------
// NSTU Campus Bus Stop Graph
// -------------------------------------------------------
// Manually defined graph representing the NSTU bus network
// Nodes = Bus stops, Edges = Routes between stops

const int TOTAL_STOPS = 12;

vector<Node> bus_stops = {
    // Route A - Sonapur Express
    {0,  "NSTU Main Gate",      "Sonapur",      22.7925, 91.1002},
    {1,  "Sonapur Bazar",       "Sonapur",      22.8012, 91.0987},
    {2,  "Companiganj",         "Companiganj",  22.8157, 91.0934},
    {3,  "Bashbaria",           "Bashbaria",    22.8287, 91.0912},
    {4,  "Maijdee Court",       "Maijdee",      22.8491, 91.0978},

    // Route B - Chowmuhani Shuttle
    {5,  "NSTU Campus Gate",    "Sonapur",      22.7918, 91.1015},
    {6,  "Begumganj Turn",      "Begumganj",    22.8074, 91.1122},
    {7,  "Jamidar Hat",         "Begumganj",    22.8243, 91.1198},
    {8,  "Chowmuhani Square",   "Chowmuhani",   22.8512, 91.1234},

    // Route C - NSTU Internal Shuttle
    {9,  "Admin Building",      "NSTU Campus",  22.7931, 91.1008},
    {10, "Academic Block",      "NSTU Campus",  22.7942, 91.1019},
    {11, "Dormitory Gate",      "NSTU Campus",  22.7909, 91.0995},
};

// Adjacency list: {to, distance_km, time_minutes}
vector<vector<Edge>> adj_list(TOTAL_STOPS);

void buildGraph() {
    // Route A: NSTU Main Gate → Maijdee Court
    // (bidirectional edges for two-way travel)
    auto addEdge = [&](int u, int v, double dist, int time) {
        adj_list[u].push_back({v, dist, time});
        adj_list[v].push_back({u, dist, time}); // return trip
    };

    // Route A stops (Sonapur Express)
    addEdge(0, 1, 1.2, 4);   // NSTU Gate → Sonapur Bazar
    addEdge(1, 2, 2.1, 6);   // Sonapur Bazar → Companiganj
    addEdge(2, 3, 1.8, 5);   // Companiganj → Bashbaria
    addEdge(3, 4, 2.4, 7);   // Bashbaria → Maijdee Court

    // Route B stops (Chowmuhani Shuttle)
    addEdge(5, 6, 1.5, 5);   // NSTU Campus Gate → Begumganj Turn
    addEdge(6, 7, 2.0, 6);   // Begumganj Turn → Jamidar Hat
    addEdge(7, 8, 2.8, 8);   // Jamidar Hat → Chowmuhani Square

    // Cross connections between routes (shared roads)
    addEdge(0, 5, 0.2, 1);   // NSTU Main Gate ↔ NSTU Campus Gate
    addEdge(1, 6, 1.0, 3);   // Sonapur Bazar ↔ Begumganj Turn
    addEdge(4, 8, 0.8, 3);   // Maijdee Court ↔ Chowmuhani Square

    // Route C: Internal NSTU Campus shuttle
    addEdge(9,  10, 0.3, 2); // Admin Building → Academic Block
    addEdge(10, 11, 0.4, 2); // Academic Block → Dormitory Gate
    addEdge(11, 0,  0.3, 2); // Dormitory Gate → NSTU Main Gate
    addEdge(9,  0,  0.2, 1); // Admin Building → NSTU Main Gate
    addEdge(9,  5,  0.2, 1); // Admin Building → NSTU Campus Gate
}

// -------------------------------------------------------
// Dijkstra's Shortest Path Algorithm
// -------------------------------------------------------
RouteResult dijkstra(int source, int destination) {
    RouteResult result;
    result.found = false;
    result.total_distance_km = 0.0;
    result.total_time_minutes = 0;

    if (source < 0 || source >= TOTAL_STOPS ||
        destination < 0 || destination >= TOTAL_STOPS) {
        result.error = "Invalid stop ID. Must be between 0 and " +
                       to_string(TOTAL_STOPS - 1);
        return result;
    }

    if (source == destination) {
        result.found = true;
        result.path = {source};
        result.total_distance_km = 0.0;
        result.total_time_minutes = 0;
        return result;
    }

    // Distance array (initialized to infinity)
    vector<double> dist(TOTAL_STOPS, numeric_limits<double>::infinity());
    vector<int> prev(TOTAL_STOPS, -1);
    vector<int> time_cost(TOTAL_STOPS, INT_MAX);

    // Min-heap priority queue
    priority_queue<PQNode, vector<PQNode>, greater<PQNode>> pq;

    dist[source] = 0.0;
    time_cost[source] = 0;
    pq.push({0.0, source});

    while (!pq.empty()) {
        auto [current_dist, u] = pq.top();
        pq.pop();

        // Skip if already processed a shorter path
        if (current_dist > dist[u]) continue;

        // Early exit if destination reached
        if (u == destination) break;

        for (const Edge& edge : adj_list[u]) {
            double new_dist = dist[u] + edge.distance_km;
            if (new_dist < dist[edge.to]) {
                dist[edge.to] = new_dist;
                prev[edge.to] = u;
                time_cost[edge.to] = time_cost[u] + edge.time_minutes;
                pq.push({new_dist, edge.to});
            }
        }
    }

    // Check if destination is reachable
    if (dist[destination] == numeric_limits<double>::infinity()) {
        result.error = "No route found between stop " +
                       to_string(source) + " and stop " + to_string(destination);
        return result;
    }

    // Reconstruct path
    vector<int> path;
    for (int v = destination; v != -1; v = prev[v]) {
        path.push_back(v);
    }
    reverse(path.begin(), path.end());

    result.found = true;
    result.path = path;
    result.total_distance_km = dist[destination];
    result.total_time_minutes = time_cost[destination];
    return result;
}

// -------------------------------------------------------
// JSON Escape Helper
// -------------------------------------------------------
string escapeJson(const string& s) {
    string result;
    for (char c : s) {
        if (c == '"')  result += "\\\"";
        else if (c == '\\') result += "\\\\";
        else if (c == '\n') result += "\\n";
        else result += c;
    }
    return result;
}

// -------------------------------------------------------
// Output Result as JSON
// -------------------------------------------------------
void outputJSON(const RouteResult& result, int source, int destination) {
    cout << "{" << endl;

    if (!result.found) {
        cout << "  \"success\": false," << endl;
        cout << "  \"error\": \"" << escapeJson(result.error) << "\"" << endl;
        cout << "}" << endl;
        return;
    }

    cout << "  \"success\": true," << endl;
    cout << "  \"source\": {" << endl;
    cout << "    \"id\": " << source << "," << endl;
    cout << "    \"name\": \"" << escapeJson(bus_stops[source].name) << "\"," << endl;
    cout << "    \"area\": \"" << escapeJson(bus_stops[source].area) << "\"" << endl;
    cout << "  }," << endl;

    cout << "  \"destination\": {" << endl;
    cout << "    \"id\": " << destination << "," << endl;
    cout << "    \"name\": \"" << escapeJson(bus_stops[destination].name) << "\"," << endl;
    cout << "    \"area\": \"" << escapeJson(bus_stops[destination].area) << "\"" << endl;
    cout << "  }," << endl;

    cout << "  \"total_distance_km\": " << result.total_distance_km << "," << endl;
    cout << "  \"total_time_minutes\": " << result.total_time_minutes << "," << endl;
    cout << "  \"stop_count\": " << result.path.size() << "," << endl;

    cout << "  \"path\": [" << endl;
    for (size_t i = 0; i < result.path.size(); i++) {
        int stopId = result.path[i];
        const Node& stop = bus_stops[stopId];
        cout << "    {" << endl;
        cout << "      \"stop_order\": " << (i + 1) << "," << endl;
        cout << "      \"id\": " << stop.id << "," << endl;
        cout << "      \"name\": \"" << escapeJson(stop.name) << "\"," << endl;
        cout << "      \"area\": \"" << escapeJson(stop.area) << "\"," << endl;
        cout << "      \"lat\": " << stop.lat << "," << endl;
        cout << "      \"lng\": " << stop.lng << endl;
        cout << "    }";
        if (i + 1 < result.path.size()) cout << ",";
        cout << endl;
    }
    cout << "  ]" << endl;
    cout << "}" << endl;
}

// -------------------------------------------------------
// Main Entry Point
// -------------------------------------------------------
int main(int argc, char* argv[]) {
    // Build the campus bus stop graph
    buildGraph();

    // Validate arguments: ./route_calculator <source_id> <destination_id>
    if (argc != 3) {
        cout << "{" << endl;
        cout << "  \"success\": false," << endl;
        cout << "  \"error\": \"Usage: route_calculator <source_stop_id> <destination_stop_id>\"," << endl;
        cout << "  \"available_stops\": [" << endl;
        for (size_t i = 0; i < bus_stops.size(); i++) {
            cout << "    {\"id\": " << bus_stops[i].id
                 << ", \"name\": \"" << escapeJson(bus_stops[i].name)
                 << "\", \"area\": \"" << escapeJson(bus_stops[i].area) << "\"}";
            if (i + 1 < bus_stops.size()) cout << ",";
            cout << endl;
        }
        cout << "  ]" << endl;
        cout << "}" << endl;
        return 1;
    }

    int source = atoi(argv[1]);
    int destination = atoi(argv[2]);

    // Run Dijkstra's algorithm
    RouteResult result = dijkstra(source, destination);

    // Output JSON result
    outputJSON(result, source, destination);

    return 0;
}

/*
 * ============================================================
 * COMPILATION INSTRUCTIONS
 * ============================================================
 * On Linux/Mac:
 *   g++ -O2 -std=c++17 -o route_calculator route_calculator.cpp
 *
 * On Windows (MinGW):
 *   g++ -O2 -std=c++17 -o route_calculator.exe route_calculator.cpp
 *
 * On Windows (XAMPP - via PHP exec):
 *   Compile once, then PHP calls: route_calculator.exe <src> <dst>
 *
 * Sample Run:
 *   ./route_calculator 0 8
 *   Output: JSON with shortest path from NSTU Main Gate to Chowmuhani Square
 * ============================================================
 */
