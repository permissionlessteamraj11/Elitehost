const fs = require('fs');
const path = require('path');

const USERS_PATH = path.join(__dirname, '../db/users.json');
const DEPLOYMENTS_PATH = path.join(__dirname, '../db/deployments.json');

const checkAndStartTrial = (userId) => {
  const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) return null;
  const user = users[userIndex];

  if (user.trialUsed === false && user.plan === 'free') {
    const now = new Date();
    const endsAt = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours

    user.trialUsed = true;
    user.trialStartedAt = now.toISOString();
    user.trialEndsAt = endsAt.toISOString();

    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    return endsAt.toISOString();
  }

  return null;
};

const checkTrialExpiry = () => {
  try {
    const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
    let changed = false;
    const now = new Date();

    deployments.forEach(deploy => {
      if (deploy.isTrial && deploy.status === 'running' && deploy.trialExpiresAt) {
        if (new Date(deploy.trialExpiresAt) < now) {
          deploy.status = 'expired';
          deploy.logs.push({ from: 'system', text: 'Free trial period ended. Deployment stopped.', timestamp: new Date().toISOString() });
          changed = true;
        }
      }
    });

    if (changed) {
      fs.writeFileSync(DEPLOYMENTS_PATH, JSON.stringify(deployments, null, 2));
    }
  } catch (err) {
    console.error('Error in trial expiry job:', err);
  }
};

module.exports = { checkAndStartTrial, checkTrialExpiry };
