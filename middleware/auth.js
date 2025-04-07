import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token.' });
      }

      req.user = user; // Set user object to request
      next(); // Proceed to next middleware or route handler
    });
  } else {
    return res.status(401).json({ message: 'You are not authenticated.' });
  }
};