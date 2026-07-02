const fs = require('fs');
const path = require('path');

const USERS_PATH = path.join(__dirname, '../db/users.json');

const getCreditsCost = (type) => {
  switch (type) {
    case 'github':
    case 'zip':
      return 2;
    case 'file':
    case 'rawcode':
      return 1;
    default:
      return 0;
  }
};

const deductCredits = (userId, type) => {
  const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) return false;

  const cost = getCreditsCost(type);
  if (users[userIndex].credits < cost) return false;

  users[userIndex].credits -= cost;
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  return true;
};

module.exports = { getCreditsCost, deductCredits };
