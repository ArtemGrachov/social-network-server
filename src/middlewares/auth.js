const jwt = require('jsonwebtoken');
const errors = require('../errors');
const constants = require('../constants');
const errorFactory = require('../utils/error-factory');
const User = require('../models/user');

module.exports = async (req, res, next) => {{
    try {
        const authHeader = req.get('Authorization');
    
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            let decodedToken;
            try {
                decodedToken = jwt.verify(token, constants.JWT_KEY);
            } catch {
                throw errorFactory(401, errors.NOT_AUTHENTICATED);
            };
    
            if (!decodedToken) {
                throw errorFactory(401, errors.NOT_AUTHENTICATED);
            }
    
            const userInstance = await User.findByPk(decodedToken.userId);
    
            if (!userInstance) {
                throw errorFactory(401, errors.NOT_AUTHENTICATED);
            }
    
            req.user = userInstance;
            console.log('!!', req.user);
        }
    
        next();
    } catch (err) {
        next(err);
    }
}
};
