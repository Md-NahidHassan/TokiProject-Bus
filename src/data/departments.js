// NSTU Faculties and Academic Departments List
export const FACULTY_DEPARTMENTS = [
  {
    faculty: '🔧 Engineering & Technology',
    departments: [
      'CSTE — Computer Science & Telecommunication Engineering',
      'ACCE — Applied Chemistry & Chemical Engineering',
      'ICE — Information & Communication Engineering',
      'EEE — Electrical & Electronic Engineering',
    ],
  },
  {
    faculty: '🔬 Science',
    departments: [
      'Applied Mathematics',
      'Environmental Science & Disaster Management',
      'Statistics',
      'Oceanography',
      'Physics',
      'Chemistry',
    ],
  },
  {
    faculty: '🌊 Biological Sciences',
    departments: [
      'Fisheries & Marine Science',
      'Pharmacy',
      'Microbiology',
      'Food Technology & Nutrition Science',
      'Biotechnology & Genetic Engineering',
      'Biochemistry & Molecular Biology',
      'Agriculture',
      'Zoology',
      'Soil, Water & Environmental Sciences',
    ],
  },
  {
    faculty: '📚 Social Science & Humanities',
    departments: [
      'English',
      'Economics',
      'Political Science',
      'Sociology',
      'Bangla',
      'Social Work',
    ],
  },
  {
    faculty: '💼 Business Studies',
    departments: [
      'Business Administration (BBA)',
      'Tourism & Hospitality Management',
      'Management Information Systems (MIS)',
    ],
  },
  {
    faculty: '👨‍🏫 Education Sciences',
    departments: [
      'Education',
      'Education Administration',
    ],
  },
  {
    faculty: '⚖️ Law',
    departments: [
      'Law',
    ],
  },
  {
    faculty: '💻 Institutes',
    departments: [
      'Software Engineering — Institute of Information Technology (IIT)',
      'Information Science — Institute of Information Sciences (IIS)',
    ],
  },
  {
    faculty: '🏢 Transport & Administration',
    departments: [
      'Transport Department',
      'Administration',
      'General / Other',
    ],
  },
];

// Flat array containing all departments
export const ALL_DEPARTMENTS = FACULTY_DEPARTMENTS.flatMap((f) => f.departments);

// Default department for student signup
export const DEFAULT_DEPARTMENT = 'CSTE — Computer Science & Telecommunication Engineering';
