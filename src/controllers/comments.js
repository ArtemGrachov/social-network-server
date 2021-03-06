const Comment = require('../models/comment');
const Post = require('../models/post');
const Notification = require('../models/notification');

const errors = require('../errors');
const success = require('../success');
const notificationTypes = require('../notification-types');

const errorFactory = require('../utils/error-factory');

exports.commentCreate = async (req, res, next) => {
    try {
        const { content, postId, referenceId } = req.body;
        const { user } = req;
        const validationErrors = {};

        if (!content) {
            validationErrors.content = [{ error: errors.REQUIRED }];
        }

        if (Object.keys(validationErrors).length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

        const post = await Post.findByPk(postId);

        if (!post) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        let reference;

        if (referenceId != null) {
            reference = await Comment.findByPk(referenceId);

            if (!reference) {
                throw errorFactory(404, errors.NOT_FOUND);
            }

            if (reference.postId !== postId) {
                throw errorFactory(422, errors.COMMENT_ANSWER_WRONG_SUBJECT);
            }
        }

        const commentInstance = await Comment.build({
            content,
            authorId: user.id,
            postId: post.id
        });

        if (reference) {
            commentInstance.referenceId = reference.id;
        }

        await commentInstance.save();

        const promises = [commentInstance.serialize(req.user)];

        if (req.user.id != post.authorId) {
            promises.push(
                Notification.create({
                    type: notificationTypes.NEW_COMMENT,
                    jsonPayload: JSON.stringify({
                        authorId: req.user.id,
                        postId: post.id
                    }),
                    ownerId: post.authorId
                })
            );
        }

        const [comment] = await Promise.all(promises);

        res
            .status(201)
            .json({
                message: success.COMMENT_CREATED_SUCCESSFULLY,
                comment
            });
    } catch (err) {
        next(err);
    }
}

exports.commentUpdate = async (req, res, next) => {
    try {
        const commentInstance = await Comment.findByPk(req.params.commentId);

        if (!commentInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        if (req.user.id !== commentInstance.authorId) {
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

        commentInstance.content = content;
        await commentInstance.save();

        const comment = await commentInstance.serialize(req.user);

        res
            .status(200)
            .json({
                message: success.COMMENT_UPDATED_SUCCESSFULLY,
                comment
            });
    } catch (err) {
        next(err);
    }
}

exports.commentDelete = async (req, res, next) => {
    try {
        let { commentId } = req.params;
        commentId = +commentId;

        const commentInstance = await Comment.findByPk(commentId);

        if (!commentInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        if (req.user.id !== commentInstance.authorId) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }

        await Comment.destroy({ where: { id: commentId }});

        res
            .status(200)
            .json({
                message: success.COMMENT_DELETED_SUCCESSFULLY,
                commentId: commentId
            });
    } catch (err) {
        next(err);
    }
}

exports.commentAddLike = async (req, res, next) => {
    try {
        const { commentId } = req.params;

        const commentInstance = await Comment.findByPk(commentId);

        if (!commentInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const promises = [commentInstance.addLikedUser(req.user)];

        if (req.user.id != commentInstance.authorId) {
            promises.push(
                Notification.create({
                    type: notificationTypes.NEW_LIKE,
                    jsonPayload: JSON.stringify({
                        likeAuthorId: req.user.id,
                        referenceId: commentId,
                        referenceType: 'comment'
                    }),
                    ownerId: commentInstance.authorId
                })
            );
        }

        await Promise.all(promises);

        res
            .status(200)
            .json({
                message: success.COMMENT_LIKED_SUCCESSFULLY,
                commentId: commentInstance.id
                
            });
    } catch (err) {
        next(err);
    }
}

exports.commentDeleteLike = async (req, res, next) => {
    try {
        const { commentId } = req.params;

        const commentInstance = await Comment.findByPk(commentId);

        if (!commentInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        await commentInstance.removeLikedUser(req.user);

        res
            .status(200)
            .json({
                message: success.COMMENT_UNLIKED_SUCCESSFULLY,
                commentId: commentInstance.id
            });
    } catch (err) {
        next(err);
    }
}
