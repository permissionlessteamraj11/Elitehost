const User = require('../models/User');
const ReferralEvent = require('../models/ReferralEvent');

exports.getWalletInfo = async (req, res) => {
  res.json({ success: true, data: req.user.wallet });
};

exports.purchasePlan = async (req, res) => {
  try {
    const { planName, amount } = req.body;
    const user = req.user;

    // In a real app, verify payment with gateway here
    user.plan = { name: planName, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) };

    if (user.referredBy) {
      const commission = amount * 0.30;
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        referrer.wallet.balance += commission;
        referrer.wallet.transactions.push({
          desc: `Referral commission - ${user.email}`,
          amount: commission,
          type: 'credit'
        });
        referrer.referralEarnings += commission;
        await referrer.save();

        await ReferralEvent.create({
          referrerId: referrer._id,
          referredUserId: user._id,
          plan: planName,
          planAmount: amount,
          commission,
          status: 'credited'
        });
      }
    }

    await user.save();
    res.json({ success: true, message: 'Plan purchased successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.withdraw = async (req, res) => {
  // Logic for withdrawal request
  res.json({ success: true, message: 'Withdrawal request submitted' });
};
