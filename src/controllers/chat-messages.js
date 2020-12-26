const ChatMessage = require('../models/chat-message');

const errors = require('../errors');
const success = require('../success');

const errorFactory = require('../utils/error-factory');

exports.chatMessageUpdate = async (req, res, next) => {
    try {
        const { chatMessageId } = req.params;
        const { user } = req;

        const chatMessageInstance = await ChatMessage.findByPk(chatMessageId);

        if (!chatMessageInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        if (user.id !== chatMessageInstance.authorId) {
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

        chatMessageInstance.content = content;
        await chatMessageInstance.save();

        const chatMessage = await chatMessageInstance.serialize(req.user);

        res
            .status(200)
            .json({
                message: success.CHAT_MESSAGE_UPDATED_SUCCESSFULLY,
                chatMessage
            });
    } catch (err) {
        next(err);
    }
}

exports.chatMessageDelete = async (req, res, next) => {
    try {
        const { chatMessageId } = req.params;

        const chatMessageInstance = await ChatMessage.findByPk(chatMessageId);

        if (!chatMessageInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        if (req.user.id !== chatMessageInstance.authorId) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }

        await ChatMessage.destroy({ where: { id: chatMessageId }});

        res
            .status(200)
            .json({
                message: success.CHAT_MESSAGE_DELETED_SUCCESSFULLY,
                chatMessageId
            });
    } catch (err) {
        next(err);
    }
}
