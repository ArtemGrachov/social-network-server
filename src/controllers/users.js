const User = require('../models/user');
const errorFactory = require('../utils/error-factory');
const errors = require('../errors');

exports.userGet = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const userInstance = await User.findByPk(userId);

        if (!userInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const user = userInstance.serialize();

        res
            .status(200)
            .json({ user });
    } catch (err) {
        next(err);
    }
}
