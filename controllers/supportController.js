const SupportMessage = require('../models/SupportMessage');

exports.getMessages = async (req, res) => {
  const messages = await SupportMessage.find({ userId: req.user._id }).sort('createdAt');
  res.json({ success: true, data: messages });
};

exports.sendMessage = async (req, res) => {
  const { message } = req.body;
  const msg = await SupportMessage.create({
    userId: req.user._id,
    sender: 'user',
    message
  });
  res.status(201).json({ success: true, data: msg });
};

exports.adminReply = async (req, res) => {
  const { userId, message } = req.body;
  const msg = await SupportMessage.create({
    userId,
    sender: 'admin',
    message
  });
  res.status(201).json({ success: true, data: msg });
};
