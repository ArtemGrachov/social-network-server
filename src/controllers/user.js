const errorFactory = require('../utils/error-factory');
const errors = require('../errors');

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
