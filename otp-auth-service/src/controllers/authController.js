const db = require('../config/database');
const bcrypt = require('bcrypt');
const { sendOTPEmail } = require('../config/mail');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, username, auth_id, role) VALUES ($1, $2, gen_random_uuid(), $3) RETURNING id',
      [email, username, 'user']
    );
    res.status(201).json({ message: 'User registered', userId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes

  try {
    await db.query(
      'INSERT INTO otp_verifications (email, otp_hash, expires_at) VALUES ($1, $2, $3)',
      [email, otpHash, expiresAt]
    );

    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) return res.status(500).json({ error: 'Failed to send email' });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const result = await db.query(
      'SELECT * FROM otp_verifications WHERE email = $1 AND verified = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const verification = result.rows[0];
    if (verification.attempts >= 5) {
      return res.status(400).json({ error: 'Maximum verification attempts exceeded' });
    }

    const isValid = await bcrypt.compare(otp, verification.otp_hash);
    if (!isValid) {
      await db.query('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1', [verification.id]);
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    await db.query('UPDATE otp_verifications SET verified = true WHERE id = $1', [verification.id]);
    await db.query('UPDATE users SET updated_at = NOW() WHERE email = $1', [email]); // Mark as active/verified

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  // Add cooldown check
  const lastOTP = await db.query(
    'SELECT created_at FROM otp_verifications WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
    [email]
  );

  if (lastOTP.rows.length > 0) {
    const lastTime = new Date(lastOTP.rows[0].created_at).getTime();
    if (Date.now() - lastTime < 60000) {
      return res.status(429).json({ error: 'Please wait 60 seconds before resending' });
    }
  }

  return this.sendOTP(req, res);
};
