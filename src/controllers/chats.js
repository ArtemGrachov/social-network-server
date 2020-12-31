const Chat = require('../models/chat');
const User = require('../models/user');
const ChatMessage = require('../models/chat-message');
const { Op } = require('sequelize');

const errors = require('../errors');
const success = require('../success');

const errorFactory = require('../utils/error-factory');
const paginationFactory = require('../utils/pagination-factory');

exports.chatCreate = async (req, res, next) => {
    try {
        const { usersIds, name } = req.body;
        const { user } = req;

        if (!(usersIds || []).length) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        const userInstances = await User.findAll({
            where: {
                id: usersIds
            }
        });
    
        if (userInstances.length !== usersIds.length) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const chatInstance = await Chat.create({
            name,
            isPrivate: user.length > 1
        });

        await Promise.all(
            [
                user,
                ...usersIds
            ].map(u => chatInstance.addUser(u))
        );

        const users = await Promise.all([
            user,
            ...userInstances
        ].map(u => u.serializeMin(user)));

        const chat = {
            ...chatInstance.serialize(),
            users: users.map(u => u.id)
        };

        res
            .status(200)
            .json({
                chat,
                users
            });
    } catch (err) {
        next(err);
    }
}

exports.chatCreateOrUseExisting = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const { user } = req;

        if (userId == user.id) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }
    
        const userInstance = await User.findByPk(userId);
    
        if (!userInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const chats = await user.getChats({
            include: [{
                model: User,
                as: 'users',
                where: {
                    id: userId
                }
            }],
            where: {
                isPrivate: true
            }
        });

        let chatInstance = chats[0];
        let created = false;

        if (!chatInstance) {
            chatInstance = await Chat.create({
                isPrivate: true
            });

            await Promise.all([
                chatInstance.addUser(user),
                chatInstance.addUser(userInstance),
            ]);

            created = true;
        }

        const users = await Promise.all([
            user,
            userInstance
        ].map(u => u.serializeMin(user)));

        const chat = {
            ...chatInstance.serialize(),
            users: users.map(u => u.id)
        };

        res
            .status(200)
            .json({
                chat,
                users,
                message: created ?
                    success.CHAT_CREATED_SUCCESSFULLY :
                    success.CHAT_FOUND_SUCCESSFULLY
            });
    } catch (err) {
        next(err);
    }
}

exports.chatGet = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { user } = req;

        if (chatId == null) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        const chats = await user.getChats({
            where: {
                id: chatId
            },
            include: [{
                model: User,
                as: 'users'
            }]
        });

        if (!chats.length) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const chatInstance = chats[0];

        const users = await Promise.all(
            chatInstance
                .users
                .map(u => u.serializeMin(user))
        );

        const chat = {
            ...chatInstance.serialize(),
            users: users.map(u => u.id)
        };

        res
            .status(200)
            .json({
                chat,
                users
            });
    } catch (err) {
        next(err);
    }
}

exports.chatsGet = async (req, res, next) => {
    try {
        const { user } = req;

        const chatsInstances = await user.getChats({
            include: [
                {
                    model: User,
                    as: 'users'
                }
            ]
        });

        const chats = chatsInstances.map(c => {
            return {
                ...c.serialize(),
                users: c.users.map(u => u.id)
            }
        });

        const usersMap = {};
        chatsInstances.forEach(c => {
            c.users.forEach(u => usersMap[u.id] = u);
        });
        
        const users = await Promise.all(
            Object.entries(usersMap)
                .map(([_, u]) => u.serializeMin(user))
        );

        res
            .status(200)
            .json({
                chats,
                users
            });
    } catch (err) {
        next(err);
    }
}

exports.chatMessageCreate = async (req, res, next) => {
    try {
        const { content } = req.body;
        const { chatId } = req.params;
        const { user } = req;
        const validationErrors = {};

        if (!content) {
            validationErrors.content = [{ error: errors.REQUIRED }];
        }

        if (Object.keys(validationErrors).length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

        const chat = await Chat.findByPk(chatId);

        if (!chat) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const chatMessageInstance = await ChatMessage.build({
            content,
            authorId: user.id,
            chatId: chat.id
        });

        await chatMessageInstance.save();

        const chatMessage = await chatMessageInstance.serialize(req.user);

        res
            .status(201)
            .json({
                message: success.CHAT_MESSAGE_CREATED_SUCCESSFULLY,
                chatMessage
            });
    } catch (err) {
        next(err);
    }
}

exports.chatMessagesGet = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        let { dateFrom, count } = req.query;

        if (!count) {
            throw errorFactory(422, errors.RECORDS_COUNT_REQUIRED);
        }

        if (!dateFrom) {
            throw errorFactory(422, errors.DATE_REQUIRED);
        }

        const chatInstance = await Chat.findByPk(chatId);

        if (!chatInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        count = +count;

        const [total, messagesInstances] = await Promise.all([
            chatInstance.countChatMessages(),
            chatInstance.getChatMessages({
                limit: count,
                order: [['createdAt', 'DESC']],
                where: {
                    createdAt: {
                        [Op.lt]: new Date(+dateFrom)
                    }
                }
            }),
        ]);

        const messages = await Promise.all(messagesInstances.map(m => m.serialize()));
        const messagesAuthors = new Set(messagesInstances.map(m => m.authorId));
        const authorsInstances = await User.findAll({
            where: { id: Array.from(messagesAuthors) }
        });

        const authors = await Promise.all(authorsInstances.map(author => author.serializeMin(req.user)));

        res
            .status(200)
            .json({
                messages,
                authors,
                pagination: paginationFactory(null, count, total)
            });
    } catch (err) {
        next(err);
    }
}
