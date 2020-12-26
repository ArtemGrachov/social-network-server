const Sequelize = require('sequelize');

const sequelize = require('./');

const Chat = sequelize.define('Chat', {
    name: {
        type: Sequelize.STRING
    },
    isPrivate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
    tableName: 'chats'
});

Chat.associate = models => {
    Chat.belongsToMany(models.User, {
        through: 'chatsUsers',
        foreignKey: 'chatId',
        otherKey: 'userId',
        as: {
            singular: 'user',
            plural:  'users'
        }
    });

    Chat.hasMany(models.ChatMessage, {
        foreignKey: 'chatId',
    });
}

Chat.prototype.serialize = function() {
    const result = {
        id: this.id,
        name: this.name || null
    };

    return result;
}

module.exports = Chat;
