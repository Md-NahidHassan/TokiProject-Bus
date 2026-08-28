// Mock data for the entire application

export const mockBuses = [
  { id: 1, busNumber: 'NSTU-01', registration: 'SYL-TA-11-0001', capacity: 45, type: 'AC', model: 'Tata LP 1613', fuel: 'Diesel', year: 2019, status: 'active', driver: 'Md. Karim Uddin', route: 'Route A', insurance: '2025-12-31', fitness: '2025-06-30', lastService: '2024-03-15', mileage: 45230 },
  { id: 2, busNumber: 'NSTU-02', registration: 'SYL-TA-11-0002', capacity: 40, type: 'Non-AC', model: 'Ashok Leyland', fuel: 'Diesel', year: 2018, status: 'active', driver: 'Md. Alam Hossain', route: 'Route B', insurance: '2025-11-30', fitness: '2025-07-31', lastService: '2024-02-20', mileage: 62100 },
  { id: 3, busNumber: 'NSTU-03', registration: 'SYL-TA-11-0003', capacity: 50, type: 'AC', model: 'Volvo B9R', fuel: 'Diesel', year: 2021, status: 'maintenance', driver: 'Unassigned', route: 'Route C', insurance: '2026-01-31', fitness: '2025-09-30', lastService: '2024-04-01', mileage: 28500 },
  { id: 4, busNumber: 'NSTU-04', registration: 'SYL-TA-11-0004', capacity: 35, type: 'Mini', model: 'Tata Magic', fuel: 'CNG', year: 2020, status: 'active', driver: 'Md. Salam', route: 'Route D', insurance: '2025-10-31', fitness: '2025-08-31', lastService: '2024-01-10', mileage: 38700 },
  { id: 5, busNumber: 'NSTU-05', registration: 'SYL-TA-11-0005', capacity: 45, type: 'AC', model: 'Hino R235', fuel: 'Diesel', year: 2022, status: 'inactive', driver: 'Unassigned', route: 'Unassigned', insurance: '2026-03-31', fitness: '2025-12-31', lastService: '2024-04-10', mileage: 15200 },
];

export const mockRoutes = [
  { id: 1, name: 'Route A - Sylhet City', start: 'NSTU Campus', destination: 'Sylhet City Center', stops: 8, distance: '12 km', time: '35 min', status: 'active', buses: 2, students: 85 },
  { id: 2, name: 'Route B - Kumarpara', start: 'NSTU Campus', destination: 'Kumarpara', stops: 6, distance: '8 km', time: '25 min', status: 'active', buses: 1, students: 62 },
  { id: 3, name: 'Route C - Ambarkhana', start: 'NSTU Campus', destination: 'Ambarkhana', stops: 5, distance: '10 km', time: '30 min', status: 'active', buses: 1, students: 74 },
  { id: 4, name: 'Route D - Shahporan', start: 'NSTU Campus', destination: 'Shahporan', stops: 7, distance: '15 km', time: '45 min', status: 'active', buses: 1, students: 48 },
];

export const mockStops = [
  { id: 1, name: 'NSTU Campus (Main Gate)', lat: 24.9034, lng: 91.8697, route: 'Route A', order: 1, arrival: '08:00 AM' },
  { id: 2, name: 'Tilagor Eco Park', lat: 24.8967, lng: 91.8623, route: 'Route A', order: 2, arrival: '08:08 AM' },
  { id: 3, name: 'Surma Gate', lat: 24.8891, lng: 91.8561, route: 'Route A', order: 3, arrival: '08:15 AM' },
  { id: 4, name: 'Ambarkhana', lat: 24.8823, lng: 91.8489, route: 'Route A', order: 4, arrival: '08:22 AM' },
  { id: 5, name: 'Zindabazar', lat: 24.8912, lng: 91.8701, route: 'Route A', order: 5, arrival: '08:30 AM' },
  { id: 6, name: 'Bondor Bazar', lat: 24.8978, lng: 91.8756, route: 'Route A', order: 6, arrival: '08:38 AM' },
];

export const mockSchedules = [
  { id: 1, bus: 'NSTU-01', driver: 'Md. Karim Uddin', route: 'Route A - Sylhet City', departure: '08:00 AM', arrival: '08:35 AM', days: ['Mon','Tue','Wed','Thu','Fri'], type: 'morning', status: 'active' },
  { id: 2, bus: 'NSTU-01', driver: 'Md. Karim Uddin', route: 'Route A - Sylhet City', departure: '02:30 PM', arrival: '03:05 PM', days: ['Mon','Tue','Wed','Thu','Fri'], type: 'afternoon', status: 'active' },
  { id: 3, bus: 'NSTU-02', driver: 'Md. Alam Hossain', route: 'Route B - Kumarpara', departure: '07:45 AM', arrival: '08:10 AM', days: ['Mon','Tue','Wed','Thu','Fri'], type: 'morning', status: 'active' },
  { id: 4, bus: 'NSTU-02', driver: 'Md. Alam Hossain', route: 'Route B - Kumarpara', departure: '02:00 PM', arrival: '02:25 PM', days: ['Mon','Tue','Wed','Thu','Fri'], type: 'afternoon', status: 'active' },
  { id: 5, bus: 'NSTU-04', driver: 'Md. Salam', route: 'Route D - Shahporan', departure: '07:30 AM', arrival: '08:15 AM', days: ['Mon','Tue','Wed','Thu','Sat'], type: 'morning', status: 'active' },
];

export const mockStudents = [
  { id: 1, studentId: 'CSE-2020-001', name: 'Nafisa Rahman', dept: 'CSE', semester: '8th', bus: 'NSTU-01', route: 'Route A', stop: 'Ambarkhana', phone: '+880 1811-001', status: 'active', attendance: 92 },
  { id: 2, studentId: 'EEE-2021-015', name: 'Md. Tanvir Ahmed', dept: 'EEE', semester: '6th', bus: 'NSTU-02', route: 'Route B', stop: 'Kumarpara', phone: '+880 1811-002', status: 'active', attendance: 88 },
  { id: 3, studentId: 'CE-2022-030', name: 'Farida Begum', dept: 'Civil', semester: '4th', bus: 'NSTU-01', route: 'Route A', stop: 'Zindabazar', phone: '+880 1811-003', status: 'active', attendance: 95 },
  { id: 4, studentId: 'ME-2021-022', name: 'Md. Jahangir Alam', dept: 'ME', semester: '6th', bus: 'NSTU-04', route: 'Route D', stop: 'Shahporan', phone: '+880 1811-004', status: 'inactive', attendance: 71 },
  { id: 5, studentId: 'BBA-2023-007', name: 'Sadia Islam', dept: 'BBA', semester: '2nd', bus: 'NSTU-02', route: 'Route B', stop: 'Surma Gate', phone: '+880 1811-005', status: 'active', attendance: 97 },
  { id: 6, studentId: 'ECE-2020-044', name: 'Rashed Khan', dept: 'ECE', semester: '8th', bus: 'NSTU-01', route: 'Route A', stop: 'Tilagor', phone: '+880 1811-006', status: 'active', attendance: 83 },
];

export const mockDrivers = [
  { id: 1, name: 'Md. Karim Uddin', license: 'DL-2022-0045', phone: '+880 1711-001', bus: 'NSTU-01', route: 'Route A', experience: '8 years', status: 'active', totalTrips: 234, rating: 4.8, joinDate: '2022-06-01' },
  { id: 2, name: 'Md. Alam Hossain', license: 'DL-2021-0033', phone: '+880 1711-002', bus: 'NSTU-02', route: 'Route B', experience: '12 years', status: 'active', totalTrips: 412, rating: 4.6, joinDate: '2021-01-15' },
  { id: 3, name: 'Md. Salam', license: 'DL-2020-0027', phone: '+880 1711-003', bus: 'NSTU-04', route: 'Route D', experience: '6 years', status: 'active', totalTrips: 189, rating: 4.7, joinDate: '2023-03-10' },
  { id: 4, name: 'Md. Rafiq', license: 'DL-2019-0018', phone: '+880 1711-004', bus: 'Unassigned', route: 'Unassigned', experience: '15 years', status: 'inactive', totalTrips: 312, rating: 4.5, joinDate: '2020-07-22' },
];

export const mockComplaints = [
  { id: 1, student: 'Nafisa Rahman', studentId: 'CSE-2020-001', type: 'Late Arrival', description: 'Bus was 20 minutes late today. No prior notice was given.', date: '2024-04-10', status: 'resolved', priority: 'medium', reply: 'We apologize for the inconvenience. Traffic was the cause. We will notify in advance.' },
  { id: 2, student: 'Md. Tanvir Ahmed', studentId: 'EEE-2021-015', type: 'Driver Behavior', description: 'Driver was speaking on phone while driving.', date: '2024-04-08', status: 'in_progress', priority: 'high', reply: '' },
  { id: 3, student: 'Farida Begum', studentId: 'CE-2022-030', type: 'Bus Condition', description: 'AC is not working in NSTU-01. Very uncomfortable.', date: '2024-04-07', status: 'pending', priority: 'medium', reply: '' },
  { id: 4, student: 'Sadia Islam', studentId: 'BBA-2023-007', type: 'Route Issue', description: 'Bus skipped Surma Gate stop without any reason.', date: '2024-04-06', status: 'resolved', priority: 'low', reply: 'The stop was temporarily skipped due to road construction. It has resumed.' },
];

export const mockMaintenance = [
  { id: 1, bus: 'NSTU-01', type: 'Oil Change', date: '2024-03-15', nextDate: '2024-06-15', cost: 3500, mechanic: 'Rahman Auto Workshop', status: 'completed', notes: 'Changed engine oil and oil filter' },
  { id: 2, bus: 'NSTU-02', type: 'Tire Replacement', date: '2024-02-20', nextDate: '2025-02-20', cost: 28000, mechanic: 'City Tire Centre', status: 'completed', notes: 'Replaced all 6 tires' },
  { id: 3, bus: 'NSTU-03', type: 'Engine Overhaul', date: '2024-04-01', nextDate: '2025-04-01', cost: 85000, mechanic: 'BRTC Workshop', status: 'in_progress', notes: 'Major engine overhaul required' },
  { id: 4, bus: 'NSTU-01', type: 'Brake Service', date: '2024-04-12', nextDate: '2024-10-12', cost: 12000, mechanic: 'Rahman Auto Workshop', status: 'scheduled', notes: 'Brake pads and discs' },
];

export const mockNotifications = [
  { id: 1, type: 'delay', title: 'Bus Delay Notice', message: 'NSTU-01 (Route A) is delayed by 15 minutes due to traffic.', time: '5 min ago', read: false, priority: 'high' },
  { id: 2, type: 'maintenance', title: 'Maintenance Alert', message: 'NSTU-03 scheduled for maintenance today. Route C temporarily suspended.', time: '1 hour ago', read: false, priority: 'medium' },
  { id: 3, type: 'announcement', title: 'Holiday Notice', message: 'No bus service on April 14 (Eid). Service resumes April 15.', time: '2 hours ago', read: true, priority: 'low' },
  { id: 4, type: 'emergency', title: 'Emergency Alert', message: 'All buses returning early today. Please check updated schedule.', time: '1 day ago', read: true, priority: 'high' },
];

export const mockAttendance = [
  { date: '2024-04-10', student: 'Nafisa Rahman', bus: 'NSTU-01', route: 'Route A', morningIn: '08:22 AM', afternoonOut: '03:05 PM', status: 'present' },
  { date: '2024-04-09', student: 'Nafisa Rahman', bus: 'NSTU-01', route: 'Route A', morningIn: '08:20 AM', afternoonOut: '03:00 PM', status: 'present' },
  { date: '2024-04-08', student: 'Nafisa Rahman', bus: 'NSTU-01', route: 'Route A', morningIn: null, afternoonOut: null, status: 'absent' },
  { date: '2024-04-07', student: 'Nafisa Rahman', bus: 'NSTU-01', route: 'Route A', morningIn: '08:25 AM', afternoonOut: '03:10 PM', status: 'present' },
];

export const analyticsData = {
  weekly: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    trips: [18, 20, 19, 22, 21, 8],
    students: [245, 268, 251, 279, 263, 89],
    attendance: [88, 92, 87, 95, 91, 75],
  },
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    trips: [380, 340, 420, 380, 410, 390],
    students: [5400, 4800, 5900, 5300, 5700, 5400],
    attendance: [86, 82, 89, 87, 91, 88],
  },
  maintenanceCost: [35000, 42000, 28000, 85000, 22000, 38000],
  fuelCost: [45000, 48000, 51000, 43000, 52000, 49000],
  complaints: [5, 8, 3, 7, 4, 6],
};
