const fs = require('fs');
const path = require('path');

const USERS_PATH = path.join(__dirname, '../db/users.json');

const generateReferralCode = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};

const processReferralCommission = (buyerId, planPrice) => {
  const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
  const buyer = users.find(u => u.id === buyerId);

  if (!buyer || !buyer.referredBy) return;

  const referrerIndex = users.findIndex(u => u.referralCode === buyer.referredBy);
  if (referrerIndex !== -1) {
    const commission = planPrice * 0.30;
    users[referrerIndex].wallet += commission;
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    console.log(`Referral commission of ${commission} added to user ${users[referrerIndex].username}`);
  }
};

module.exports = { generateReferralCode, processReferralCommission };
