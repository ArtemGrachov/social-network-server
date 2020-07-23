const Post = require('../models/post');
const errorFactory = require('../utils/error-factory');
const errors = require('../errors');
const success = require('../success');

exports.postCreate = async (req, res, next) => {
    try {
        const { content } = req.body;
        const { user } = req;
        const validationErrors = [];

        if (!content) {
            validationErrors.push(errors.POST_CONTENT_REQUIRED);
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
