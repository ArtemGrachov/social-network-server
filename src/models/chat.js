const Sequelize = require('sequelize');

const sequelize = require('./');

const Chat = sequelize.define('Chat', {
    name: {
        type: Sequelize.STRING
    }
}, {
    tableName: 'chats'
});

Chat.associate = models => {
    Chat.belongsToMany(models.Chat, {
        through: 'chatsUsers',
        foreignKey: 'userId',
        otherKey: 'chatId',
        as: 'chat'
    });
}

module.exports = Chat;
