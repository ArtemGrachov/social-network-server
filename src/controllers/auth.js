const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const errorFactory = require('../utils/error-factory');
const errors = require('../errors');
const success = require('../success');
const constants = require('../constants');
const mail = require('../mail');

exports.registration = async (req, res, next) => {
    try {
        const {
            email,
            password,
            passwordConfirmation,
            firstname,
            lastname
        } = req.body;

        const validationErrors = [];

        if (email) {
            if (!validator.isEmail(email)) {
                validationErrors.push(errors.INVALID_EMAIL);
            }
        } else {
            validationErrors.push(errors.EMAIL_REQUIRED);
        }

        if (password) {
            if (!validator.isLength(password, { min: 8, max: 18 })) {
                validationErrors.push(errors.INVALID_PASSWORD);
            };
        } else {
            validationErrors.push(errors.PASSWORD_REQUIRED);
        }

        if (password !== passwordConfirmation) {
            validationErrors.push(errors.PASSWORDS_ARE_NOT_EQUAL);
        }

        if (!firstname) {
            validationErrors.push(errors.FIRSTNAME_REQUIRED);
        }

        if (!lastname) {
            validationErrors.push(errors.LASTNAME_REQUIRED);
        }

        if (validationErrors.length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

        const registeredUser = await User.findOne({
            where: {
                email
            }
        });

        if (registeredUser) {
            throw errorFactory(422, errors.EMAIL_ALREADY_REGISTERED);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await User.create({
            firstname,
            lastname,
            email,
            password: passwordHash,
        });

        res
            .status(201)
            .json({ message: success.USER_REGISTERED_SUCCESSFULLY });
    } catch (err) {
        next(err);
    }
}

exports.logIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: {
                email
            }
        });

        if (!user) {
            throw errorFactory(401, errors.INCORRECT_EMAIL_OR_PASSWORD);
        }

        const passwordCheck = await bcrypt.compare(password, user.password);

        if (!passwordCheck) {
            throw errorFactory(401, errors.INCORRECT_EMAIL_OR_PASSWORD);
        }

        const tokens = user.getAuthTokens();

        res
            .status(200)
            .json(tokens);
    } catch (err) {
        next(err);
    }
}

exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        let decodedToken;
        try {
            decodedToken = jwt.verify(refreshToken, constants.JWT_REFRESH_KEY);
        } catch (err) {
            console.log(err);
            throw errorFactory(401, errors.INVALID_REFRESH_TOKEN);
        }

        const { userId } = decodedToken;

        const user = await User.findByPk(userId);

        const tokens = user.getAuthTokens();

        res
            .status(200)
            .json(tokens);
    } catch (err) {
        next(err);
    }
}

exports.changePassword = async (req, res, next) => {
    try {
        const password = req.body.password;
        const passwordConfirmation = req.body.passwordConfirmation;

        if (!password || !passwordConfirmation) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        const validationErrors = [];

        if (!validator.isLength(password, { min: 8, max: 18 })) {
            validationErrors.push(errors.INVALID_PASSWORD);
        }

        if (password !== passwordConfirmation) {
            validationErrors.push(errors.PASSWORDS_ARE_NOT_EQUAL);
        }

        if (validationErrors.length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.findByPk(req.userId);

        user.password = passwordHash;

        await user.save();

        res
            .status(200)
            .json({
                message: success.PASSWORD_UPDATED_SUCCESSFULLY
            });
    } catch(err) {
        next(err);
    }
}

exports.generateResetPasswordToken = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            throw errorFactory(422, errors.INVALID_EMAIL);
        }
        const resetPasswordToken = user.getResetPasswordToken();

        const mailOptions = {
            from: `'"${constants.EMAIL_FROM_NAME}" <${constants.EMAIL_FROM}>'`,
            to: email,
            subject: 'Password reset link',
            text: `Your reset link is: ${resetPasswordToken}`
        };

        await mail.sendMail(mailOptions);

        res
            .status(200)
            .json({
                message: success.RESET_PASSWORD_TOKEN_GENERATED_SUCCESSFULLY
            });
    } catch (err) {
        next(err);
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const { resetPasswordToken, password, passwordConfirmation } = req.body;

        let decodedToken;
        try {
            decodedToken = jwt.verify(resetPasswordToken, constants.RESET_PASSWORD_TOKEN);
        } catch {
            throw errorFactory(401, errors.INVALID_RESET_PASSWORD_TOKEN);
        }

        const { userId } = decodedToken;

        const user = await User.findByPk(userId);

        if (!user) {
            throw errorFactory(401, errors.INVALID_RESET_PASSWORD_TOKEN);
        }

        if (password !== passwordConfirmation) {
            throw errorFactory(422, errors.PASSWORDS_ARE_NOT_EQUAL);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        user.password = passwordHash;

        await user.save();

        res
            .status(200)
            .json({
                message: success.PASSWORD_UPDATED_SUCCESSFULLY
            });
    } catch (err) {
        next(err);
    }
}
