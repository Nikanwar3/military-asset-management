import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

function Transfers() {
  const { token, user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({
    assetName: '',
    assetType: 'Vehicle',
    quantity: '',
    fromBase: user?.base || 'Base Alpha',
    toBase: 'Base Bravo'
  });

  const headers = { Authorization: `Bearer ${token}` };
  const canCreate = user?.role === 'Admin' || user?.role === 'Logistics Officer';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, assetsRes] = await Promise.all([
        axios.get(`${API_URL}/transfers`, { headers }),
        axios.get(`${API_URL}/assets`, { headers })
      ]);
      setTransfers(transRes.data);
      setAssets(assetsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (form.fromBase === form.toBase) {
      setMessage({ text: 'Source and destination base cannot be the same', type: 'error' });
      return;
    }

    try {
      await axios.post(`${API_URL}/transfers`, {
        ...form,
        quantity: parseInt(form.quantity)
      }, { headers });
      setMessage({ text: 'Transfer initiated successfully!', type: 'success' });
      setForm({ assetName: '', assetType: 'Vehicle', quantity: '', fromBase: user?.base || 'Base Alpha', toBase: 'Base Bravo' });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to initiate transfer', type: 'error' });
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`${API_URL}/transfers/${id}/complete`, {}, { headers });
      setMessage({ text: 'Transfer completed successfully!', type: 'success' });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to complete transfer', type: 'error' });
    }
  };

  const filteredTransfers = transfers.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1>Transfers</h1>
        <p>Manage asset transfers between bases</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {canCreate && (
        <div className="form-container">
          <h2>Initiate New Transfer</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Asset Name</label>
                <input
                  type="text"
                  value={form.assetName}
                  onChange={e => setForm({ ...form, assetName: e.target.value })}
                  placeholder="e.g., Humvee"
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
                <label>From Base</label>
                <select value={form.fromBase} onChange={e => setForm({ ...form, fromBase: e.target.value })}
                  disabled={user?.role !== 'Admin'}>
                  <option value="Base Alpha">Base Alpha</option>
                  <option value="Base Bravo">Base Bravo</option>
                  <option value="Base Charlie">Base Charlie</option>
                  <option value="Base Delta">Base Delta</option>
                </select>
              </div>
              <div className="form-group">
                <label>To Base</label>
                <select value={form.toBase} onChange={e => setForm({ ...form, toBase: e.target.value })}>
                  <option value="Base Alpha">Base Alpha</option>
                  <option value="Base Bravo">Base Bravo</option>
                  <option value="Base Charlie">Base Charlie</option>
                  <option value="Base Delta">Base Delta</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Initiate Transfer</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Transit">In Transit</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Transfers Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>Transfer Records</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Type</th>
              <th>Qty</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Initiated By</th>
              <th>Date</th>
              {canCreate && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredTransfers.length === 0 ? (
              <tr><td colSpan={canCreate ? "9" : "8"} style={{ textAlign: 'center', color: '#888' }}>No transfers found</td></tr>
            ) : (
              filteredTransfers.map(t => (
                <tr key={t._id}>
                  <td>{t.assetName}</td>
                  <td>{t.assetType}</td>
                  <td>{t.quantity}</td>
                  <td>{t.fromBase}</td>
                  <td>{t.toBase}</td>
                  <td><span className={`badge badge-${t.status.toLowerCase().replace(' ', '')}`}>{t.status}</span></td>
                  <td>{t.initiatedBy}</td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  {canCreate && (
                    <td>
                      {t.status === 'Pending' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleComplete(t._id)}>
                          Complete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transfers;
