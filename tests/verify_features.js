const fs = require('fs');
const path = require('path');
const { processReferralCommission } = require('../server/utils/referral');

// Setup mock data
const USERS_PATH = path.join(__dirname, '../server/db/users.json');
const originalUsers = fs.readFileSync(USERS_PATH, 'utf8');

try {
    const mockUsers = [
        { id: 'user1', username: 'Referrer', referralCode: 'REF123', wallet: 0 },
        { id: 'user2', username: 'Buyer', referredBy: 'REF123', wallet: 0 }
    ];
    fs.writeFileSync(USERS_PATH, JSON.stringify(mockUsers, null, 2));

    console.log('Testing Referral Commission...');
    processReferralCommission('user2', 1000); // 1000 * 0.3 = 300

    const updatedUsers = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    const referrer = updatedUsers.find(u => u.id === 'user1');

    if (referrer.wallet === 300) {
        console.log('✅ Referral commission test passed: 300 added to wallet.');
    } else {
        console.error('❌ Referral commission test failed: Expected 300, got ' + referrer.wallet);
    }

} catch (err) {
    console.error('Test failed:', err);
} finally {
    // Restore original data
    fs.writeFileSync(USERS_PATH, originalUsers);
    console.log('Original data restored.');
}
