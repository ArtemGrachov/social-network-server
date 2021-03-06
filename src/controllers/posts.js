const Post = require('../models/post');
const User = require('../models/user');
const Notification = require('../models/notification');

const errors = require('../errors');
const success = require('../success');
const notificationTypes = require('../notification-types');

const errorFactory = require('../utils/error-factory');
const paginationFactory = require('../utils/pagination-factory');

exports.postCreate = async (req, res, next) => {
    try {
        const { content } = req.body;
        const { user } = req;
        const validationErrors = {};

        if (!content) {
            validationErrors.content = [{ error: errors.REQUIRED }];
        }

        if (Object.keys(validationErrors).length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

        const postInstance = await Post.create({
            content,
            authorId: user.id
        });

        const post = await postInstance.serialize(req.user);

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

        const validationErrors = {};

        if (!content) {
            validationErrors.content = [{ error: errors.REQUIRED }];
        }

        if (Object.keys(validationErrors).length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

        postInstance.content = content;
        await postInstance.save();

        const post = await postInstance.serialize(req.user);

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
        let { postId } = req.params;
        postId = +postId;

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

        const promises = [postInstance.addLikedUser(req.user)];

        if (postInstance.authorId != req.user.id) {
            promises.push(
                Notification.create({
                    type: notificationTypes.NEW_LIKE,
                    jsonPayload: JSON.stringify({
                        likeAuthorId: req.user.id,
                        referenceId: postId,
                        referenceType: 'post'
                    }),
                    ownerId: postInstance.authorId
                })
            );
        }

        await Promise.all(promises);

        res
            .status(200)
            .json({
                message: success.POST_LIKED_SUCCESSFULLY,
                postId: postInstance.id
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
                postId: postInstance.id
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
                limit: count,
                offset: (page - 1) * count,
                order: [['createdAt', 'DESC']]
            }),
        ]);

        const comments = await Promise.all(commentsInstances.map(comment => comment.serialize(req.user)));
        const commentsAuthors = new Set(commentsInstances.map(comment => comment.authorId));
        const authorsInstances = await User.findAll({
            where: { id: Array.from(commentsAuthors) }
        });

        const authors = await Promise.all(authorsInstances.map(author => author.serializeMin(req.user)));

        res
            .status(200)
            .json({
                comments,
                authors,
                pagination: paginationFactory(page, count, total)
            });
    } catch (err) {
        next(err);
    }
}

exports.postGet = async (req, res, next) => {
    try {
        const { postId } = req.params;

        const postInstance = await Post.findByPk(postId, { include: ['author'] });

        if (!postInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const [post, author] = await Promise.all([
            postInstance.serialize(req.user),
            postInstance.author.serializeMin(req.user)
        ]);

        res
            .status(200)
            .json({
                post,
                author
            });
    } catch (err) {
        next(err);
    }
}
