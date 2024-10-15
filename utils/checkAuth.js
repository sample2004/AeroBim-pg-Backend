import jwt from 'jsonwebtoken';
export default (req, res, next) => {
    const token = (req.headers.authorization || '').split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, 'SECRET');
            req.userId = decoded._id;
            next();
        } catch (e) {
            return res.status(401).send('Access denied. No token provided.');
        }
    } else
    {
        return res.status(401).send('Access denied. No token provided.');
    }
}