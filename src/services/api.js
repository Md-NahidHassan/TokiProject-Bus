// NSTU Bus Tracker API Service Layer
const API_BASE_URL = 'http://localhost/NSTU-BUS-TRACKER'; // XAMPP Localhost Path

export const USE_REAL_PHP_BACKEND = true; // Connected to XAMPP MySQL Backend

// API Helper wrapper
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    return await response.json();
  } catch (error) {
    console.warn(`API call failed for ${endpoint}. Falling back to mock data.`, error);
    return null;
  }
}

// Student API Services
export const StudentAPI = {
  getDashboard: (studentId = 4) => fetchAPI(`/api/student/dashboard.php?student_id=${studentId}`),
  getSchedules: () => fetchAPI('/api/student/schedules.php'),
  getBusPass: (studentId = 4) => fetchAPI(`/api/student/bus_pass.php?student_id=${studentId}`),
  submitComplaint: (data) => fetchAPI('/api/student/submit_complaint.php', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Live Tracking API Services
export const TrackingAPI = {
  getBuses: () => fetchAPI('/api/tracking/get_buses.php'),
  updateLocation: (data) => fetchAPI('/api/tracking/update_location.php', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Driver API Services
export const DriverAPI = {
  getDashboard: (driverId = 3) => fetchAPI(`/api/driver/dashboard.php?driver_id=${driverId}`),
  updateGPS: (data) => fetchAPI('/api/driver/update_gps.php', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  controlTrip: (data) => fetchAPI('/api/driver/trip_control.php', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  scanPass: (data) => fetchAPI('/api/driver/scan_student_pass.php', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Admin API Services
export const AdminAPI = {
  getStats: () => fetchAPI('/api/admin/dashboard_stats.php'),
  getBuses: () => fetchAPI('/api/admin/manage_buses.php'),
  addBus: (data) => fetchAPI('/api/admin/manage_buses.php', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateBus: (id, data) => fetchAPI(`/api/admin/manage_buses.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteBus: (id) => fetchAPI(`/api/admin/manage_buses.php?id=${id}`, {
    method: 'DELETE',
  }),
  getRoutes: () => fetchAPI('/api/admin/manage_routes.php'),
  addRoute: (data) => fetchAPI('/api/admin/manage_routes.php', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRoute: (id, data) => fetchAPI(`/api/admin/manage_routes.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteRoute: (id) => fetchAPI(`/api/admin/manage_routes.php?id=${id}`, {
    method: 'DELETE',
  }),
  getStops: () => fetchAPI('/api/admin/manage_stops.php'),
  addStop: (data) => fetchAPI('/api/admin/manage_stops.php', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStop: (id, data) => fetchAPI(`/api/admin/manage_stops.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteStop: (id) => fetchAPI(`/api/admin/manage_stops.php?id=${id}`, {
    method: 'DELETE',
  }),
  getUsers: (role = '') => fetchAPI(`/api/admin/manage_users.php?role=${role}`),
  addUser: (data) => fetchAPI('/api/admin/manage_users.php', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getComplaints: () => fetchAPI('/api/admin/manage_complaints.php'),
  updateComplaintStatus: (data) => fetchAPI('/api/admin/manage_complaints.php', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getSchedules: () => fetchAPI('/api/admin/manage_schedules.php'),
  addSchedule: (data) => fetchAPI('/api/admin/manage_schedules.php', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSchedule: (id, data) => fetchAPI(`/api/admin/manage_schedules.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteSchedule: (id) => fetchAPI(`/api/admin/manage_schedules.php?id=${id}`, {
    method: 'DELETE',
  }),
  getNotifications: () => fetchAPI('/api/admin/manage_notifications.php'),
  addNotification: (data) => fetchAPI('/api/admin/manage_notifications.php', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteNotification: (id) => fetchAPI(`/api/admin/manage_notifications.php?id=${id}`, {
    method: 'DELETE',
  }),
  getAttendance: () => fetchAPI('/api/admin/manage_attendance.php'),
  getDrivers: () => fetchAPI('/api/admin/manage_users.php?role=driver'),
  getStudents: () => fetchAPI('/api/admin/manage_users.php?role=student'),
  updateUser: (id, data) => fetchAPI(`/api/admin/manage_users.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteUser: (id) => fetchAPI(`/api/admin/manage_users.php?id=${id}`, {
    method: 'DELETE',
  }),
};

// Auth API Services
export const AuthAPI = {
  login: (credentials) => fetchAPI('/api/auth/login.php', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  signup: (userData) => fetchAPI('/api/auth/signup.php', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

// C++ Route Calculator API (Dijkstra Algorithm - Shortest Path)
// Calls: api/cpp/route_calculator.php → route_calculator.exe (C++ binary)
export const CppRouteAPI = {
  /**
   * Find shortest bus route between two stops using C++ Dijkstra algorithm
   * @param {number} sourceId - Source stop ID (0–11)
   * @param {number} destinationId - Destination stop ID (0–11)
   */
  getShortestRoute: (sourceId, destinationId) =>
    fetchAPI(`/api/cpp/route_calculator.php?source=${sourceId}&destination=${destinationId}`),

  /**
   * Get all available bus stops from C++ program
   * Called without args to list all stops
   */
  getAllStops: () =>
    fetchAPI('/api/cpp/route_calculator.php'),
};
