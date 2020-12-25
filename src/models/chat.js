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
    Chat.belongsToMany(models.User, {
        through: 'chatsUsers',
        foreignKey: 'userId',
        otherKey: 'chatId',
        as: {
            singular: 'user',
            plural:  'users'
        }
    });
}

module.exports = Chat;
