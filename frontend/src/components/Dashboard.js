import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

function Dashboard() {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [filterBase, setFilterBase] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedBase, setSelectedBase] = useState(null);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, transRes] = await Promise.all([
        axios.get(`${API_URL}/assets/dashboard`, { headers }),
        axios.get(`${API_URL}/transfers`, { headers })
      ]);
      setDashboardData(dashRes.data);
      setTransfers(transRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: '#888', padding: 40 }}>Loading dashboard...</div>;
  if (!dashboardData) return <div style={{ color: '#e74c3c', padding: 40 }}>Failed to load data</div>;

  const { totalAssets, totalBases, basesSummary, assets } = dashboardData;

  const filteredAssets = assets.filter(a => {
    if (filterBase && a.base !== filterBase) return false;
    if (filterType && a.type !== filterType) return false;
    return true;
  });

  const bases = Object.keys(basesSummary);

  // Calculate net movements per base
  const getNetMovements = (baseName) => {
    const incoming = transfers.filter(t => t.toBase === baseName && t.status === 'Completed')
      .reduce((sum, t) => sum + t.quantity, 0);
    const outgoing = transfers.filter(t => t.fromBase === baseName && t.status === 'Completed')
      .reduce((sum, t) => sum + t.quantity, 0);
    return { incoming, outgoing, net: incoming - outgoing };
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of military assets across all bases</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Assets</h3>
          <div className="value">{totalAssets.toLocaleString()}</div>
          <div className="label">Across all bases</div>
        </div>
        <div className="stat-card">
          <h3>Active Bases</h3>
          <div className="value">{totalBases}</div>
          <div className="label">Operational</div>
        </div>
        <div className="stat-card">
          <h3>Pending Transfers</h3>
          <div className="value">{transfers.filter(t => t.status === 'Pending').length}</div>
          <div className="label">Awaiting completion</div>
        </div>
        <div className="stat-card">
          <h3>Completed Transfers</h3>
          <div className="value">{transfers.filter(t => t.status === 'Completed').length}</div>
          <div className="label">Successfully moved</div>
        </div>
      </div>

      {/* Base Summary Cards */}
      <div className="base-cards">
        {bases.map(baseName => {
          const data = basesSummary[baseName];
          const movements = getNetMovements(baseName);
          return (
            <div key={baseName} className="base-card" onClick={() => setSelectedBase(baseName)}>
              <h3>{baseName}</h3>
              <div className="base-card-stats">
                <div className="base-card-stat">
                  <div className="num">{data.vehicles}</div>
                  <div className="lbl">Vehicles</div>
                </div>
                <div className="base-card-stat">
                  <div className="num">{data.weapons}</div>
                  <div className="lbl">Weapons</div>
                </div>
                <div className="base-card-stat">
                  <div className="num">{data.ammunition.toLocaleString()}</div>
                  <div className="lbl">Ammunition</div>
                </div>
                <div className="base-card-stat">
                  <div className="num">{data.equipment}</div>
                  <div className="lbl">Equipment</div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
                Net Movement: <span style={{ color: movements.net >= 0 ? '#4ecca3' : '#e74c3c' }}>
                  {movements.net >= 0 ? '+' : ''}{movements.net}
                </span>
                {' '}(In: {movements.incoming} / Out: {movements.outgoing})
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="filters">
        <select value={filterBase} onChange={e => setFilterBase(e.target.value)}>
          <option value="">All Bases</option>
          {bases.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Weapon">Weapon</option>
          <option value="Ammunition">Ammunition</option>
          <option value="Equipment">Equipment</option>
        </select>
      </div>

      {/* Assets Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>Asset Inventory</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Base</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: '#888' }}>No assets found</td></tr>
            ) : (
              filteredAssets.map(asset => (
                <tr key={asset._id}>
                  <td>{asset.assetName}</td>
                  <td>{asset.type}</td>
                  <td>{asset.quantity.toLocaleString()}</td>
                  <td>{asset.base}</td>
                  <td>
                    <span className={`badge badge-${asset.status.toLowerCase()}`}>
                      {asset.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Net Movements Popup */}
      {selectedBase && (
        <div className="modal-overlay" onClick={() => setSelectedBase(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedBase(null)}>&times;</button>
            <h2>{selectedBase} - Detailed View</h2>

            <h3 style={{ color: '#888', fontSize: 14, marginBottom: 10, marginTop: 15 }}>ASSET BREAKDOWN</h3>
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.filter(a => a.base === selectedBase).map(a => (
                  <tr key={a._id}>
                    <td>{a.assetName}</td>
                    <td>{a.type}</td>
                    <td>{a.quantity.toLocaleString()}</td>
                    <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ color: '#888', fontSize: 14, marginBottom: 10, marginTop: 20 }}>NET MOVEMENTS</h3>
            {(() => {
              const m = getNetMovements(selectedBase);
              return (
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div className="stat-card">
                    <h3>Incoming</h3>
                    <div className="value" style={{ color: '#4ecca3' }}>{m.incoming}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Outgoing</h3>
                    <div className="value" style={{ color: '#e74c3c' }}>{m.outgoing}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Net</h3>
                    <div className="value" style={{ color: m.net >= 0 ? '#4ecca3' : '#e74c3c' }}>
                      {m.net >= 0 ? '+' : ''}{m.net}
                    </div>
                  </div>
                </div>
              );
            })()}

            <h3 style={{ color: '#888', fontSize: 14, marginBottom: 10, marginTop: 20 }}>RECENT TRANSFERS</h3>
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transfers.filter(t => t.fromBase === selectedBase || t.toBase === selectedBase).length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: '#888' }}>No transfers</td></tr>
                ) : (
                  transfers.filter(t => t.fromBase === selectedBase || t.toBase === selectedBase).map(t => (
                    <tr key={t._id}>
                      <td>{t.assetName}</td>
                      <td>{t.fromBase}</td>
                      <td>{t.toBase}</td>
                      <td>{t.quantity}</td>
                      <td><span className={`badge badge-${t.status.toLowerCase()}`}>{t.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
