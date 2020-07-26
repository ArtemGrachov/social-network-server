const Post = require('../models/post');
const errorFactory = require('../utils/error-factory');
const paginationFactory = require('../utils/pagination-factory');
const errors = require('../errors');
const success = require('../success');

exports.postCreate = async (req, res, next) => {
    try {
        const { content } = req.body;
        const { user } = req;
        const validationErrors = [];

        if (!content) {
            validationErrors.push({ field: 'content', error: errors.REQUIRED });
        }

        if (validationErrors.length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

        const postInstance = await Post.create({
            content,
            authorId: user.id
        });

        const post = postInstance.serialize();

        res
            .status(201)
            .json({
                message: success.POST_CREATED_SUCCESSFULLY,
                post
            });
    } catch (err) {
        next(err);
    }
}

exports.postUpdate = async (req, res, next) => {
    try {
        const postInstance = await Post.findByPk(req.params.postId);

        if (!postInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        if (req.user.id !== postInstance.authorId) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }

        const { content } = req.body;

        const validationErrors = [];

        if (!content) {
            validationErrors.push({ field: 'content', error: errors.REQUIRED });
        }

        if (validationErrors.length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

        postInstance.content = content;
        await postInstance.save();

        const post = postInstance.serialize();

        res
            .status(200)
            .json({
                message: success.POST_UPDATED_SUCCESSFULLY,
                post
            });
    } catch (err) {
        next(err);
    }
}

exports.postDelete = async (req, res, next) => {
    try {
        const { postId } = req.params;

        const postInstance = await Post.findByPk(postId);

        if (!postInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        if (req.user.id !== postInstance.authorId) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }

        await Post.destroy({ where: { id: postId }});

        res
            .status(200)
            .json({
                message: success.POST_DELETED_SUCCESSFULLY,
                postId
            });
    } catch (err) {
        next(err);
    }
}

exports.postAddLike = async (req, res, next) => {
    try {
        const { postId } = req.params;

        const postInstance = await Post.findByPk(postId);

        if (!postInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        await postInstance.addLikedUser(req.user);

        res
            .status(200)
            .json({
                message: success.POST_LIKED_SUCCESSFULLY,
                postId
            });
    } catch (err) {
        next(err);
    }
}

exports.postDeleteLike = async (req, res, next) => {
    try {
        const { postId } = req.params;

        const postInstance = await Post.findByPk(postId);

        if (!postInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        await postInstance.removeLikedUser(req.user);

        res
            .status(200)
            .json({
                message: success.POST_UNLIKED_SUCCESSFULLY,
                postId
            });
    } catch (err) {
        next(err);
    }
}

exports.postGetComments = async (req, res, next) => {
    try {
        let { page, count } = req.query;

        if (!page) {
            throw errorFactory(422, errors.PAGE_REQUIRED);
        }

        if (!count) {
            throw errorFactory(422, errors.RECORDS_COUNT_REQUIRED);
        }

        const postInstance = await Post.findByPk(req.params.postId);

        if (!postInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        page = +page;
        count = +count;

        const [total, commentsInstances] = await Promise.all([
            postInstance.countComments(),
            postInstance.getComments({
                limit: page * count,
                offset: (page - 1) * count
            }),
        ]);

        const comments = commentsInstances.map(comment => comment.serialize());

        res
            .status(200)
            .json({
                comments,
                pagination: paginationFactory(page, count, total)
            });
    } catch (err) {
        next(err);
    }
}
