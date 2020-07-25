const User = require('../models/user');
const errorFactory = require('../utils/error-factory');
const errors = require('../errors');
const success = require('../success');

exports.userUpdate = async (req, res, next) => {
    try {
        const { body } = req;

        if (!Object.keys(body).length) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        const { firstname, lastname, country, city, phone, avatarURL, status } = body;

        const userInstance = req.user;

        if (firstname != null) {
            userInstance.firstname = firstname;
        }

        if (lastname != null) {
            userInstance.lastname = lastname;
        }

        if (country != null) {
            userInstance.country = country;
        }

        if (city != null) {
            userInstance.city = city;
        }

        if (phone != null) {
            userInstance.phone = phone;
        }

        if (avatarURL != null) {
            userInstance.avatarURL = avatarURL;
        }

        if (status != null) {
            userInstance.status = status;
        }

        await userInstance.save();

        const user = userInstance.serialize();

        res
            .status(200)
            .json({ user });
    } catch (err) {
        next(err);
    }
}

exports.userSubscribeTo = async (req, res, next) => {
    try {
        const { subscriptionId } = req.body;

        if (req.user.id === subscriptionId) {
            throw errorFactory(422, errors.USER_CANNOT_SUBSCRIBE_TO_HIMSELF)
        }

        const subscription = await User.findByPk(subscriptionId);

        if (!subscription) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        await req.user.addSubscription(subscription);

        res
            .status(200)
            .json({
                message: success.SUBSCRIPTION_ADDED_SUCCESSFULLY,
                subscriptionId
            });
    } catch (err) {
        next(err);
    };
}

exports.userUnsubscribeFrom = async (req, res, next) => {
    try {
        const { subscriptionId } = req.params;

        const sub = await User.findByPk(subscriptionId);

        await req.user.removeSubscription(sub);

        res
            .status(200)
            .json({
                message: success.SUBSCRIPTION_REMOVED_SUCCESSFULLY
            });
    } catch (err) {
        next(err);
    }
}
