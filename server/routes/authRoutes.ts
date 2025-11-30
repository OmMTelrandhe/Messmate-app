// authRoutes.ts

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

// Middleware to authenticate JWT
function authenticateJWT(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
}

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.comparePassword(password)) {
        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET);
        return res.json({ token });
    } else {
        return res.sendStatus(403);
    }
});

// Example protected route
router.get('/protected', authenticateJWT, (req, res) => {
    res.send('This is a protected route, visible only to authenticated users.');
});

export default router;