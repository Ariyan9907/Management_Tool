const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Check for session-based auth first
    if (req.session && req.session.userId) {
      req.userId = req.session.userId;
      return next();
    }

    // Check for JWT token in cookies or Authorization header
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.split(' '));
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // JWT secret hardcoded (no .env)
    const decoded = jwt.verify(token, 'my-super-secret-jwt-key-12345');
    req.userId = decoded.userId;
    
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
