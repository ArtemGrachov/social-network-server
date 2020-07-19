const jwt = require('jsonwebtoken');
const errors = require('../errors');
const constants = require('../constants');
const errorFactory = require('../utils/error-factory');

module.exports = (req, res, next) => {
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

        req.userId = decodedToken.userId;
    }

    next();
};
