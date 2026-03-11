export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403);
    throw new Error('Access denied: Admin only');
};
