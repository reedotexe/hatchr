const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  if (!token) return res.status(401).json({ success: false, message: 'Invalid token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.userId = decoded._id; // Updated to use _id
    req.user = { _id: decoded._id }; // Using _id consistently
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};