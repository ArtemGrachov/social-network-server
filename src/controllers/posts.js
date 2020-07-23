const Post = require('../models/post');
const errorFactory = require('../utils/error-factory');
const errors = require('../errors');
const success = require('../success');

exports.postCreate = async (req, res, next) => {
    try {
        const { content } = req.body;
        const { userId } = req;
        const validationErrors = [];

        if (!content) {
            validationErrors.push(errors.POST_CONTENT_REQUIRED);
        }

        if (validationErrors.length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

        const postInstance = await Post.create({
            content,
            author: userId
        });

        console.log(postInstance);

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
