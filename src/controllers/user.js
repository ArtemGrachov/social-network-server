const User = require('../models/user');
const Post = require('../models/post');
const errorFactory = require('../utils/error-factory');
const paginationFactory = require('../utils/pagination-factory');
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

exports.userGetNews = async (req, res, next) => {
    try {
        const { user } = req;

        let { page, count } = req.query;

        page = +page;
        count = +count;

        if (!page) {
            throw errorFactory(422, errors.PAGE_REQUIRED);
        }

        if (!count) {
            throw errorFactory(422, errors.RECORDS_COUNT_REQUIRED);
        }

        const subscriptions = await user.getSubscriptions();
        const subscriptionIds = subscriptions.map(s => s.id);

        const { rows, count: total } = await Post.findAndCountAll({
            where: {
                authorId: [...subscriptionIds, user.id]
            },
            limit: count,
            offset: (page - 1) * count,
            order: [['createdAt', 'DESC']]
        });

        const posts = await Promise.all(rows.map(post => post.serialize(req.user)));
        const postsAuthors = new Set(rows.map(post => post.authorId));

        const authorsInstances = [...subscriptions, user].filter(user => {
            return postsAuthors.has(user.id);
        });

        const authors = await Promise.all(authorsInstances.map(author => author.serializeMin(req.user)));

        res
            .status(200)
            .json({
                posts,
                authors,
                pagination: paginationFactory(page, count, total)
            });
    } catch (err) {
        next(err);
    }
}
