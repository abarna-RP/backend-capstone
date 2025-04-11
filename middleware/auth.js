import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'You are not authenticated.' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(400).json({ message: 'Invalid token format.' });
    }

    const token = parts[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Token has expired.' });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ message: 'Invalid token signature.' });
            } else {
                return res.status(403).json({ message: 'Failed to authenticate token.' });
            }
        }

        req.user = {
            _id: decoded._id,
            role: decoded.role,
        };
        next();
    });
};