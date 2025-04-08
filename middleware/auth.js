import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET_KEY, {
     
      // issuer: 'your-issuer',
      // audience: 'your-audience',
    }, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({ message: 'Token expired.' });
        } else {
          return res.status(403).json({ message: 'Invalid token.' });
        }
      }

      req.user = {
        _id: decoded._id,
        role: decoded.role,
      }; 
      next();
    });
  } else {
    return res.status(401).json({ message: 'You are not authenticated.' });
  }
};