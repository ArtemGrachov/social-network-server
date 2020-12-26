const Chat = require('../models/chat');
const User = require('../models/user');

const errors = require('../errors');

const errorFactory = require('../utils/error-factory');

exports.chatCreate = async (req, res, next) => {
    try {
        const { usersIds } = req.body;
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
            isPrivate: user.length > 1
        });

        await Promise.all(
            [
                user,
                ...usersIds
            ].map(u => chatInstance.addUser(u))
        );

        res
            .status(200)
            .json({ chat: chatInstance });
    } catch (err) {
        next(err);
    }
}

exports.chatCreateOrUseExisting = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const { user } = req;
    
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

        let chat = chats[0];

        if (!chat) {
            chat = await Chat.create({
                isPrivate: true
            });

            await Promise.all([
                chat.addUser(user),
                chat.addUser(userInstance),
            ]);
        }

        res
            .status(200)
            .json({
                myId: user.id,
                chat
            });
    } catch (err) {
        next(err);
    }
}

