const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function start() {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = 'testsecret';
  process.env.SESSION_SECRET = 'testsession';
  process.env.GITHUB_CLIENT_ID = 'mock';
  process.env.GITHUB_CLIENT_SECRET = 'mock';
  process.env.GITHUB_CALLBACK_URL = 'http://localhost:3000/callback';
  process.env.ADMIN_USERNAME = 'rajpapa';
  process.env.ADMIN_PASSWORD = '28@RajPapa';

  require('./server.js');
}

start();
