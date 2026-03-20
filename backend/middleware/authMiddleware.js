import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
        req.user = decoded; // Contains id, email, role
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid or Expired Token!' });
    }
};

export default authMiddleware;
