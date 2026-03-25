const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Asset = require('./models/asset');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/military-assets';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Asset.deleteMany({});

    // Create users
    const users = [
      { username: 'admin', password: await bcrypt.hash('admin123', 10), role: 'Admin', base: '' },
      { username: 'commander_alpha', password: await bcrypt.hash('commander123', 10), role: 'Base Commander', base: 'Base Alpha' },
      { username: 'commander_bravo', password: await bcrypt.hash('commander123', 10), role: 'Base Commander', base: 'Base Bravo' },
      { username: 'logistics_alpha', password: await bcrypt.hash('logistics123', 10), role: 'Logistics Officer', base: 'Base Alpha' },
      { username: 'logistics_bravo', password: await bcrypt.hash('logistics123', 10), role: 'Logistics Officer', base: 'Base Bravo' }
    ];
    await User.insertMany(users);
    console.log('Users seeded');

    // Create assets
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
    console.log('Assets seeded');

    console.log('\n--- Login Credentials ---');
    console.log('Admin: admin / admin123');
    console.log('Base Commander Alpha: commander_alpha / commander123');
    console.log('Base Commander Bravo: commander_bravo / commander123');
    console.log('Logistics Alpha: logistics_alpha / logistics123');
    console.log('Logistics Bravo: logistics_bravo / logistics123');

    await mongoose.disconnect();
    console.log('\nSeeding complete!');
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
};

seedData();
