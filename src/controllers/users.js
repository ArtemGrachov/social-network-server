const User = require('../models/user');
const Post = require('../models/post');
const errorFactory = require('../utils/error-factory');
const paginationFactory = require('../utils/pagination-factory');
const errors = require('../errors');

exports.userGet = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const userInstance = await User.findByPk(userId);

        if (!userInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const user = await userInstance.serialize(req.user);

        res
            .status(200)
            .json({ user });
    } catch (err) {
        next(err);
    }
}

exports.userGetPosts = async (req, res, next) => {
    try {
        const { userId } = req.params;
        let { page, count } = req.query;

        page = +page;
        count = +count;

        if (!page) {
            throw errorFactory(422, errors.PAGE_REQUIRED);
        }

        if (!count) {
            throw errorFactory(422, errors.RECORDS_COUNT_REQUIRED);
        }

        const postsInstances = await Post.findAndCountAll({
            where: {
                authorId: userId
            },
            limit: count,
            offset: (page - 1) * count,
            order: [['createdAt', 'DESC']]
        });

        const posts = await Promise.all(postsInstances.rows.map(post => post.serialize(req.user)));

        res
            .status(200)
            .json({
                posts,
                pagination: paginationFactory(page, count, postsInstances.count)
            });
    } catch (err) {
        next(err);
    }
}

exports.userGetSubscriptions = async (req, res, next) => {
    try {
        const { userId } = req.params;
        let { page, count } = req.query;

        if (!page) {
            throw errorFactory(422, errors.PAGE_REQUIRED);
        }

        if (!count) {
            throw errorFactory(422, errors.RECORDS_COUNT_REQUIRED);
        }

        page = +page;
        count = +count;

        const userInstance = await User.findByPk(userId);

        if (!userInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const [total, usersInstances] = await Promise.all([
            userInstance.countSubscriptions(),
            userInstance.getSubscriptions({
                limit: count,
                offset: (page - 1) * count
            }),
        ]);

        const users = await Promise.all(usersInstances.map(user => user.serializeMin(req.user)));

        res
            .status(200)
            .json({
                users,
                pagination: paginationFactory(page, count, total)
            })
    } catch (err) {
        next(err);
    }
}

exports.userGetSubscribers = async (req, res, next) => {
    try {
        const { userId } = req.params;
        let { page, count } = req.query;

        if (!page) {
            throw errorFactory(422, errors.PAGE_REQUIRED);
        }

        if (!count) {
            throw errorFactory(422, errors.RECORDS_COUNT_REQUIRED);
        }

        page = +page;
        count = +count;

        const userInstance = await User.findByPk(userId);

        if (!userInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const [total, usersInstances] = await Promise.all([
            userInstance.countSubscribers(),
            userInstance.getSubscribers({
                limit: count,
                offset: (page - 1) * count
            }),
        ]);

        const users = await Promise.all(usersInstances.map(user => user.serializeMin(req.user)));

        res
            .status(200)
            .json({
                users,
                pagination: paginationFactory(page, count, total)
            });
    } catch (err) {
        next(err);
    }
}
