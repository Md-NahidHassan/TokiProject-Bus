import { useState, useEffect } from 'react';
import { Send, Plus, MessageSquare, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { PageHeader, SectionCard, Modal, StatCard } from '../components/ui/SharedComponents';
import { mockComplaints } from '../data/mockData';
import { AdminAPI, StudentAPI, USE_REAL_PHP_BACKEND } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState(mockComplaints);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ type: '', description: '', priority: 'medium' });

  const isAdmin = user?.role === 'super_admin' || user?.role === 'transport_admin';

  const loadData = async () => {
    if (USE_REAL_PHP_BACKEND) {
      if (isAdmin) {
        const res = await AdminAPI.getComplaints();
        if (res && res.success) {
          setComplaints(res.data.map(c => ({
            id: c.id,
            student: c.student_name,
            studentId: c.department || 'Unknown',
            type: c.category || c.subject || 'General',
            description: c.description,
            date: c.created_at ? c.created_at.slice(0, 10) : '',
            status: c.status || 'pending',
            priority: 'medium', // Defaulting as backend doesn't have it
            reply: c.reply || ''
          })));
        }
      }
    }
  };
  useEffect(() => { loadData(); }, [isAdmin]);

  const filtered = complaints.filter(c => filter === 'all' || c.status === filter);

  const submitComplaint = async () => {
    if (USE_REAL_PHP_BACKEND) {
      const payload = {
        user_id: user?.id,
        category: form.type,
        subject: form.type,
        description: form.description
      };
      const res = await StudentAPI.submitComplaint(payload);
      if (res && res.success) { toast.success('Complaint submitted successfully!'); loadData(); }
      else toast.error(res?.message || 'Failed to submit');
    } else {
      setComplaints(p => [...p, { id: Date.now(), student: user?.name, studentId: user?.studentId || 'CSE-2020-001', type: form.type, description: form.description, date: new Date().toISOString().split('T')[0], status: 'pending', priority: form.priority, reply: '' }]);
      toast.success('Complaint submitted successfully!');
    }
    setModal(null);
    setForm({ type: '', description: '', priority: 'medium' });
  };

  const sendReply = async () => {
    if (USE_REAL_PHP_BACKEND && isAdmin) {
      // Assuming manage_complaints.php PUTs to reply or something. For now just updating status:
      const res = await AdminAPI.updateComplaintStatus({ complaint_id: selected.id, status: 'resolved', reply: reply });
      if (res && res.success) { toast.success('Reply sent & complaint resolved!'); loadData(); }
      else toast.error(res?.message || 'Failed to update');
    } else {
      setComplaints(p => p.map(c => c.id === selected.id ? { ...c, reply, status: 'resolved' } : c));
      toast.success('Reply sent & complaint resolved!');
    }
    setModal(null);
    setReply('');
  };

  const updateStatus = async (id, status) => {
    if (USE_REAL_PHP_BACKEND && isAdmin) {
      const res = await AdminAPI.updateComplaintStatus({ complaint_id: id, status });
      if (res && res.success) { toast.success(`Status updated to ${status}`); loadData(); }
      else toast.error(res?.message || 'Failed to update');
    } else {
      setComplaints(p => p.map(c => c.id === id ? { ...c, status } : c));
      toast.success(`Status updated to ${status}`);
    }
  };

  const priorityColors = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-info' };
  const statusColors = { pending: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success' };
  const statusIcons = { pending: Clock, in_progress: AlertCircle, resolved: CheckCircle };

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Complaint Management"
        subtitle="Track and manage all complaints"
        action={
          !isAdmin && (
            <button onClick={() => setModal('submit')} className="btn btn-primary">
              <Plus size={16} /> Submit Complaint
            </button>
          )
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={MessageSquare} label="Total" value={complaints.length} color="primary" />
        <StatCard icon={Clock} label="Pending" value={complaints.filter(c=>c.status==='pending').length} color="warning" />
        <StatCard icon={AlertCircle} label="In Progress" value={complaints.filter(c=>c.status==='in_progress').length} color="info" />
        <StatCard icon={CheckCircle} label="Resolved" value={complaints.filter(c=>c.status==='resolved').length} color="success" />
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all','pending','in_progress','resolved'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === s ? 'gradient-primary text-white' : 'bg-[#161b22] text-[#8b949e] border border-[#21262d] hover:text-white'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(c => {
          const StatusIcon = statusIcons[c.status] || Clock;
          return (
            <div key={c.id} className="section-card p-5 card-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-white">{c.type}</span>
                    <span className={`badge ${priorityColors[c.priority]}`}>{c.priority}</span>
                    <span className={`badge ${statusColors[c.status]}`}>
                      <StatusIcon size={10} className="mr-1" />
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-[#8b949e] mb-2">
                    <span className="font-medium text-[#c9d1d9]">{c.student}</span> ({c.studentId}) · {c.date}
                  </div>
                  <p className="text-sm text-[#c9d1d9]">{c.description}</p>
                  {c.reply && (
                    <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="text-xs font-semibold text-emerald-400 mb-1">Admin Response:</div>
                      <div className="text-sm text-[#c9d1d9]">{c.reply}</div>
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setSelected(c); setModal('reply'); }}
                      className="btn btn-sm btn-primary"
                    >
                      <Send size={12} /> Reply
                    </button>
                    {c.status !== 'resolved' && (
                      <button
                        onClick={() => updateStatus(c.id, 'resolved')}
                        className="btn btn-sm btn-success"
                      >
                        <CheckCircle size={12} /> Resolve
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Modal (Student) */}
      <Modal open={modal === 'submit'} onClose={() => setModal(null)} title="Submit Complaint">
        <div className="space-y-4">
          <div>
            <label className="form-label">Complaint Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="form-input">
              <option value="">Select type...</option>
              {['Late Arrival', 'Driver Behavior', 'Bus Condition', 'Route Issue', 'AC Problem', 'Other'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Priority</label>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="form-input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={4}
              placeholder="Describe your complaint in detail..."
              className="form-input resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="btn btn-secondary">Cancel</button>
            <button onClick={submitComplaint} className="btn btn-primary" disabled={!form.type || !form.description}>
              <Send size={16} /> Submit
            </button>
          </div>
        </div>
      </Modal>

      {/* Reply Modal (Admin) */}
      <Modal open={modal === 'reply'} onClose={() => setModal(null)} title="Reply to Complaint">
        {selected && (
          <div className="space-y-4">
            <div className="p-4 bg-[#0d1117] rounded-xl border border-[#21262d]">
              <div className="text-xs text-[#484f58] mb-1">{selected.student} · {selected.date}</div>
              <div className="font-medium text-white mb-1">{selected.type}</div>
              <div className="text-sm text-[#8b949e]">{selected.description}</div>
            </div>
            <div>
              <label className="form-label">Your Reply</label>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                rows={4}
                placeholder="Type your response..."
                className="form-input resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={sendReply} className="btn btn-primary" disabled={!reply}>
                <Send size={16} /> Send Reply
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
