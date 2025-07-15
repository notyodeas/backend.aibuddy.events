const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send();
    try {
        const decoded = jwt.verify(token, process.env.JWT || 'abc');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).send('Invalid token')
    }
}