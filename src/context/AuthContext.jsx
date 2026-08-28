import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Default demo users (pre-seeded in localStorage)
const DEFAULT_USERS = [
  {
    id: 1,
    name: 'Dr. Abdullah Al-Mamun',
    email: 'admin@nstu.edu.bd',
    phone: '+8801711000001',
    studentId: null,
    password: 'password',
    role: 'super_admin',
    avatar: null,
    department: 'Administration',
    joinDate: '2020-01-15',
  },
  {
    id: 2,
    name: 'Md. Rafiqul Islam',
    email: 'transport@nstu.edu.bd',
    phone: '+8801711000002',
    studentId: null,
    password: 'password',
    role: 'transport_admin',
    avatar: null,
    department: 'Transport Department',
    joinDate: '2021-03-10',
  },
  {
    id: 3,
    name: 'Md. Karim Uddin',
    email: 'driver@nstu.edu.bd',
    phone: '+8801711000003',
    studentId: null,
    password: 'password',
    role: 'driver',
    avatar: null,
    department: 'Transport Department',
    joinDate: '2022-06-01',
    license: 'DL-2022-0045',
    busAssigned: 'NSTU-01',
  },
  {
    id: 4,
    name: 'Nafisa Rahman',
    email: 'student@nstu.edu.bd',
    phone: '+8801711000004',
    studentId: 'CSE-2020-001',
    password: 'password',
    role: 'student',
    avatar: null,
    department: 'Computer Science & Engineering',
    joinDate: '2022-01-01',
    semester: '8th',
    busAssigned: 'NSTU-01',
  },
];

// ─── LocalStorage Helpers ───────────────────────────────────────
function loadUsers() {
  try {
    const stored = localStorage.getItem('nstu_users');
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  localStorage.setItem('nstu_users', JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

function saveUsers(users) {
  localStorage.setItem('nstu_users', JSON.stringify(users));
}

function loadSession() {
  try {
    const stored = localStorage.getItem('nstu_session');
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  return null;
}

function saveSession(user) {
  if (user) {
    const { password: _, ...safe } = user;
    localStorage.setItem('nstu_session', JSON.stringify(safe));
  } else {
    localStorage.removeItem('nstu_session');
  }
}

// ─── Provider ────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Restore session on app load
  useEffect(() => {
    const session = loadSession();
    if (session) setUser(session);
    loadUsers(); // Ensure default users are seeded
  }, []);

  /**
   * Login — accepts Gmail/email, phone number, or student ID + password
   * Also supports quick role-based demo login (role key only)
   */
  const login = async (identifier, password, role = null) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));

    const users = loadUsers();

    // Quick demo role login (no password needed)
    if (role && !identifier) {
      const roleMap = {
        super_admin: users.find(u => u.role === 'super_admin'),
        transport_admin: users.find(u => u.role === 'transport_admin'),
        driver: users.find(u => u.role === 'driver'),
        student: users.find(u => u.role === 'student'),
      };
      const found = roleMap[role];
      if (found) {
        const { password: _, ...safe } = found;
        setUser(safe);
        saveSession(safe);
        setLoading(false);
        return { success: true };
      }
    }

    if (!identifier || !password) {
      setLoading(false);
      return { success: false, error: 'Please enter your credentials' };
    }

    // Normalize identifier
    const id = identifier.trim().toLowerCase();

    // Match by email, phone, or studentId
    const matched = users.find(u => {
      const emailMatch   = u.email?.toLowerCase() === id;
      const rawPhone     = (u.phone || '').replace(/[\s\-()]/g, '');
      const inputPhone   = identifier.trim().replace(/[\s\-()]/g, '');
      const phoneMatch   = rawPhone === inputPhone;
      const studentMatch = u.studentId?.toLowerCase() === id;
      return emailMatch || phoneMatch || studentMatch;
    });

    if (!matched) {
      setLoading(false);
      return { success: false, error: 'No account found with this email, phone, or Student ID' };
    }

    if (matched.password !== password) {
      setLoading(false);
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const { password: _, ...safe } = matched;
    setUser(safe);
    saveSession(safe);
    setLoading(false);
    return { success: true };
  };

  /**
   * Sign Up — register a new account
   */
  const signup = async ({ name, email, phone, studentId, password, role, department }) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const users = loadUsers();

    // Check duplicate email
    if (email && users.find(u => u.email?.toLowerCase() === email.toLowerCase())) {
      setLoading(false);
      return { success: false, error: 'This email is already registered. Please login.' };
    }

    // Check duplicate phone
    if (phone) {
      const normalizedInput = phone.replace(/[\s\-()]/g, '');
      if (users.find(u => (u.phone || '').replace(/[\s\-()]/g, '') === normalizedInput)) {
        setLoading(false);
        return { success: false, error: 'This phone number is already registered.' };
      }
    }

    // Check duplicate student ID
    if (studentId && users.find(u => u.studentId?.toLowerCase() === studentId.toLowerCase())) {
      setLoading(false);
      return { success: false, error: 'This Student ID is already registered.' };
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      studentId: studentId?.trim() || null,
      password,
      role: role || 'student',
      avatar: null,
      department: department || 'General',
      joinDate: new Date().toISOString().split('T')[0],
    };

    const updated = [...users, newUser];
    saveUsers(updated);

    // Auto-login after signup
    const { password: _, ...safe } = newUser;
    setUser(safe);
    saveSession(safe);
    setLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    saveSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
