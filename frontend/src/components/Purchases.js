import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

function Purchases() {
  const { token, user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [filterBase, setFilterBase] = useState('');
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState({
    assetName: '',
    assetType: 'Vehicle',
    quantity: '',
    base: user?.base || 'Base Alpha'
  });

  const headers = { Authorization: `Bearer ${token}` };
  const canCreate = user?.role === 'Admin' || user?.role === 'Logistics Officer';

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${API_URL}/purchases`, { headers });
      setPurchases(res.data);
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      await axios.post(`${API_URL}/purchases`, {
        ...form,
        quantity: parseInt(form.quantity)
      }, { headers });
      setMessage({ text: 'Purchase recorded successfully!', type: 'success' });
      setForm({ assetName: '', assetType: 'Vehicle', quantity: '', base: user?.base || 'Base Alpha' });
      fetchPurchases();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to record purchase', type: 'error' });
    }
  };

  const filteredPurchases = purchases.filter(p => {
    if (filterBase && p.base !== filterBase) return false;
    if (filterType && p.assetType !== filterType) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1>Purchases</h1>
        <p>Record and track asset purchases</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {canCreate && (
        <div className="form-container">
          <h2>Record New Purchase</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Asset Name</label>
                <input
                  type="text"
                  value={form.assetName}
                  onChange={e => setForm({ ...form, assetName: e.target.value })}
                  placeholder="e.g., M1 Abrams Tank"
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
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Record Purchase</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <select value={filterBase} onChange={e => setFilterBase(e.target.value)}>
          <option value="">All Bases</option>
          <option value="Base Alpha">Base Alpha</option>
          <option value="Base Bravo">Base Bravo</option>
          <option value="Base Charlie">Base Charlie</option>
          <option value="Base Delta">Base Delta</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Weapon">Weapon</option>
          <option value="Ammunition">Ammunition</option>
          <option value="Equipment">Equipment</option>
        </select>
      </div>

      {/* Purchases Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>Purchase Records</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Base</th>
              <th>Purchased By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: '#888' }}>No purchases found</td></tr>
            ) : (
              filteredPurchases.map(p => (
                <tr key={p._id}>
                  <td>{p.assetName}</td>
                  <td>{p.assetType}</td>
                  <td>{p.quantity.toLocaleString()}</td>
                  <td>{p.base}</td>
                  <td>{p.purchasedBy}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Purchases;
