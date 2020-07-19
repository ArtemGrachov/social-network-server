const errors = require('../errors');
const errorFactory = require('../utils/error-factory');

module.exports = (req, res, next) => {
    if (!req.userId) {
        const error = errorFactory(401, errors.NOT_AUTHENTICATED);
        throw error;
    };
    next();
};
