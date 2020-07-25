const Comment = require('../models/comment');
const Post = require('../models/post');
const errorFactory = require('../utils/error-factory');
const errors = require('../errors');
const success = require('../success');

exports.commentCreate = async (req, res, next) => {
    try {
        const { content, postId, referenceId } = req.body;
        const { user } = req;
        const validationErrors = [];

        if (!content) {
            validationErrors.push(errors.com);
        }

        if (validationErrors.length) {
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

        const comment = commentInstance.serialize();

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
