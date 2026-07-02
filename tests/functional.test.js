const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function runTests() {
  console.log('🧪 Starting Functional Tests with MongoMemoryServer...');

  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to In-Memory DB');

    // Test Registration
    const passwordHash = await bcrypt.hash('password123', 12);
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
      referralCode: 'TEST-123'
    });
    console.log('✅ User Registration Model Test Passed');

    // Test Login
    const isMatch = await user.comparePassword('password123');
    if (isMatch) console.log('✅ Password Comparison Test Passed');
    else throw new Error('Password comparison failed');

    console.log('✅ All model tests passed');

  } catch (err) {
    console.error('❌ Test Failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
    console.log('🏁 Tests Finished');
  }
}

runTests();
