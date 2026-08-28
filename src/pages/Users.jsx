import { useState } from 'react';
import { Users, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { PageHeader, SectionCard, SearchBar, Modal, StatCard } from '../components/ui/SharedComponents';
import toast from 'react-hot-toast';

const initialUsers = [
  { id:1, name:'Dr. Abdullah Al-Mamun', email:'admin@nstu.edu.bd', role:'super_admin', status:'active', joinDate:'2020-01-15', dept:'Administration' },
  { id:2, name:'Md. Rafiqul Islam', email:'transport@nstu.edu.bd', role:'transport_admin', status:'active', joinDate:'2021-03-10', dept:'Transport' },
  { id:3, name:'Md. Karim Uddin', email:'driver@nstu.edu.bd', role:'driver', status:'active', joinDate:'2022-06-01', dept:'Transport' },
  { id:4, name:'Nafisa Rahman', email:'student@nstu.edu.bd', role:'student', status:'active', joinDate:'2023-01-05', dept:'CSE' },
  { id:5, name:'Md. Alam Hossain', email:'alam@nstu.edu.bd', role:'driver', status:'active', joinDate:'2021-01-15', dept:'Transport' },
  { id:6, name:'Sadia Islam', email:'sadia@nstu.edu.bd', role:'student', status:'inactive', joinDate:'2023-08-01', dept:'BBA' },
];

const ROLES = ['super_admin','transport_admin','driver','student'];
const roleColors = { super_admin:'badge-primary', transport_admin:'badge-purple', driver:'badge-info', student:'badge-success' };

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({ name:'', email:'', role:'student', status:'active', dept:'' }); setModal('add'); };
  const openEdit = (u) => { setSelected(u); setForm({ ...u }); setModal('edit'); };
  const handleSave = () => {
    if (modal === 'add') {
      setUsers(p => [...p, { ...form, id: Date.now(), joinDate: new Date().toISOString().split('T')[0] }]);
      toast.success('User added!');
    } else {
      setUsers(p => p.map(u => u.id === selected.id ? { ...u, ...form } : u));
      toast.success('User updated!');
    }
    setModal(null);
  };
  const handleDelete = (id) => { setUsers(p => p.filter(u => u.id !== id)); toast.success('User removed.'); };

  return (
    <div className="page-container p-6">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} users in the system`}
        action={<button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Add User</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {ROLES.map(r => (
          <div key={r} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#8b949e] mb-2">{r.replace('_', ' ')}</div>
                <div className="text-3xl font-bold text-white">{users.filter(u => u.role === r).length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Shield size={18} className="text-blue-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <SectionCard title="All Users" action={<SearchBar value={search} onChange={setSearch} placeholder="Search users..." />}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium text-white text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-xs text-[#8b949e]">{u.email}</td>
                  <td><span className={`badge ${roleColors[u.role] || 'badge-primary'}`}>{u.role.replace('_',' ')}</span></td>
                  <td className="text-xs text-[#8b949e]">{u.dept}</td>
                  <td className="text-xs text-[#8b949e]">{u.joinDate}</td>
                  <td><span className={`badge ${u.status==='active'?'badge-success':'badge-danger'}`}>{u.status}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-amber-400 hover:bg-amber-500/10 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add User' : 'Edit User'}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key:'name', label:'Full Name', type:'text' },
            { key:'email', label:'Email', type:'email' },
            { key:'dept', label:'Department', type:'text' },
            { key:'role', label:'Role', type:'select', options: ROLES },
            { key:'status', label:'Status', type:'select', options:['active','inactive'] },
          ].map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              {f.type === 'select' ? (
                <select value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="form-input">
                  {f.options.map(o=><option key={o} value={o}>{o.replace('_',' ')}</option>)}
                </select>
              ) : (
                <input type={f.type} value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="form-input" />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={() => setModal(null)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">{modal==='add'?'Add User':'Save'}</button>
        </div>
      </Modal>
    </div>
  );
}
