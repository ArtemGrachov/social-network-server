const errors = require('../errors');
const Chat = require('../models/chat');
const User = require('../models/user');
const errorFactory = require('../utils/error-factory');

exports.chatCreate = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const { user } = req;
    
        const userInstance = await User.findByPk(userId);
    
        if (!userInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const chatInstance = await Chat.create();

        await Promise.all([
            chatInstance.addUser(user),
            chatInstance.addUser(userInstance),
        ]);

        res
            .status(200)
            .json({ chat: chatInstance });
    } catch (err) {
        next(err);
    }
}
