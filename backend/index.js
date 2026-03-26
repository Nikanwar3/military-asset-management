const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const purchaseRoutes = require('./routes/purchases');
const transferRoutes = require('./routes/transfers');
const assignmentRoutes = require('./routes/assignments');
const assetRoutes = require('./routes/assets');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/assets', assetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Seed endpoint (one-time use to populate database)
app.post('/api/seed', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('./models/user');
    const Asset = require('./models/asset');

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.json({ message: 'Database already seeded' });
    }

    const users = [
      { username: 'admin', password: await bcrypt.hash('admin123', 10), role: 'Admin', base: '' },
      { username: 'commander_alpha', password: await bcrypt.hash('commander123', 10), role: 'Base Commander', base: 'Base Alpha' },
      { username: 'commander_bravo', password: await bcrypt.hash('commander123', 10), role: 'Base Commander', base: 'Base Bravo' },
      { username: 'logistics_alpha', password: await bcrypt.hash('logistics123', 10), role: 'Logistics Officer', base: 'Base Alpha' },
      { username: 'logistics_bravo', password: await bcrypt.hash('logistics123', 10), role: 'Logistics Officer', base: 'Base Bravo' }
    ];
    await User.insertMany(users);

    const assets = [
      { assetName: 'M1 Abrams Tank', type: 'Vehicle', quantity: 10, base: 'Base Alpha', status: 'Available' },
      { assetName: 'Humvee', type: 'Vehicle', quantity: 25, base: 'Base Alpha', status: 'Available' },
      { assetName: 'M16 Rifle', type: 'Weapon', quantity: 200, base: 'Base Alpha', status: 'Available' },
      { assetName: '5.56mm Rounds', type: 'Ammunition', quantity: 50000, base: 'Base Alpha', status: 'Available' },
      { assetName: 'Night Vision Goggles', type: 'Equipment', quantity: 50, base: 'Base Alpha', status: 'Available' },
      { assetName: 'Bradley IFV', type: 'Vehicle', quantity: 8, base: 'Base Bravo', status: 'Available' },
      { assetName: 'Humvee', type: 'Vehicle', quantity: 15, base: 'Base Bravo', status: 'Available' },
      { assetName: 'M4 Carbine', type: 'Weapon', quantity: 150, base: 'Base Bravo', status: 'Available' },
      { assetName: '7.62mm Rounds', type: 'Ammunition', quantity: 30000, base: 'Base Bravo', status: 'Available' },
      { assetName: 'Body Armor', type: 'Equipment', quantity: 100, base: 'Base Bravo', status: 'Available' }
    ];
    await Asset.insertMany(assets);

    res.json({ message: 'Database seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Seed failed', error: err.message });
  }
});

// Connect to MongoDB and start server
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/military-assets';
const PORT = process.env.PORT || 5002;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
