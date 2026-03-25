import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

function Assignments() {
  const { token, user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [filterType, setFilterType] = useState('');
  const [filterAssetType, setFilterAssetType] = useState('');
  const [form, setForm] = useState({
    assetName: '',
    assetType: 'Vehicle',
    quantity: '',
    base: user?.base || 'Base Alpha',
    assignedTo: '',
    type: 'Assignment'
  });

  const headers = { Authorization: `Bearer ${token}` };
  const canCreate = user?.role === 'Admin' || user?.role === 'Base Commander';

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_URL}/assignments`, { headers });
      setAssignments(res.data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      await axios.post(`${API_URL}/assignments`, {
        ...form,
        quantity: parseInt(form.quantity)
      }, { headers });
      setMessage({ text: `${form.type} recorded successfully!`, type: 'success' });
      setForm({ assetName: '', assetType: 'Vehicle', quantity: '', base: user?.base || 'Base Alpha', assignedTo: '', type: 'Assignment' });
      fetchAssignments();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to record', type: 'error' });
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (filterType && a.type !== filterType) return false;
    if (filterAssetType && a.assetType !== filterAssetType) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1>Assignments & Expenditures</h1>
        <p>Manage asset assignments and expenditure records</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {canCreate && (
        <div className="form-container">
          <h2>Record Assignment / Expenditure</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="Assignment">Assignment</option>
                  <option value="Expenditure">Expenditure</option>
                </select>
              </div>
              <div className="form-group">
                <label>Asset Name</label>
                <input
                  type="text"
                  value={form.assetName}
                  onChange={e => setForm({ ...form, assetName: e.target.value })}
                  placeholder="e.g., M16 Rifle"
                  required
                />
              </div>
              <div className="form-group">
                <label>Asset Type</label>
                <select value={form.assetType} onChange={e => setForm({ ...form, assetType: e.target.value })}>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Weapon">Weapon</option>
                  <option value="Ammunition">Ammunition</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Base</label>
                <select value={form.base} onChange={e => setForm({ ...form, base: e.target.value })}
                  disabled={user?.role !== 'Admin'}>
                  <option value="Base Alpha">Base Alpha</option>
                  <option value="Base Bravo">Base Bravo</option>
                  <option value="Base Charlie">Base Charlie</option>
                  <option value="Base Delta">Base Delta</option>
                </select>
              </div>
              <div className="form-group">
                <label>{form.type === 'Assignment' ? 'Assigned To' : 'Reason / Operation'}</label>
                <input
                  type="text"
                  value={form.assignedTo}
                  onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                  placeholder={form.type === 'Assignment' ? 'e.g., Unit 7 Bravo' : 'e.g., Operation Shield'}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Record {form.type}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="Assignment">Assignment</option>
          <option value="Expenditure">Expenditure</option>
        </select>
        <select value={filterAssetType} onChange={e => setFilterAssetType(e.target.value)}>
          <option value="">All Asset Types</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Weapon">Weapon</option>
          <option value="Ammunition">Ammunition</option>
          <option value="Equipment">Equipment</option>
        </select>
      </div>

      {/* Assignments Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>Assignment & Expenditure Records</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Asset Name</th>
              <th>Asset Type</th>
              <th>Quantity</th>
              <th>Base</th>
              <th>Assigned To / Reason</th>
              <th>Assigned By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', color: '#888' }}>No records found</td></tr>
            ) : (
              filteredAssignments.map(a => (
                <tr key={a._id}>
                  <td>
                    <span className={`badge ${a.type === 'Assignment' ? 'badge-assigned' : 'badge-expended'}`}>
                      {a.type}
                    </span>
                  </td>
                  <td>{a.assetName}</td>
                  <td>{a.assetType}</td>
                  <td>{a.quantity.toLocaleString()}</td>
                  <td>{a.base}</td>
                  <td>{a.assignedTo}</td>
                  <td>{a.assignedBy}</td>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Assignments;
