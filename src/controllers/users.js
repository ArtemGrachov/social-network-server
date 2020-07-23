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

        const user = userInstance.serialize();

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
            limit: page * count,
            offset: (page - 1) * count
        });

        const posts = postsInstances.rows.map(post => post.serialize());

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
