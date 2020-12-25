const Sequelize = require('sequelize');

const sequelize = require('./');

const ChatMessage = sequelize.define('ChatMessage', {
    content: {
        type: Sequelize.TEXT,
        allowNull: false,
        set(value) {
            this.setDataValue('content', value);
            this.setDataValue(
                'textContent',
                htmlToText.fromString(value, {
                    wordwrap: false,
                    noLinkBrackets: true,
                    ignoreHref: true,
                    ignoreImage: true,
                    uppercaseHeadings: false
                })
            );
        }
    },
    textContent: {
        type: Sequelize.TEXT,
        allowNull: false,
        set() {
            throw new Error(`'textContent' column can not be set directly. Change 'content' column instead.`)
        }
    }
}, {
    tableName: 'chatMessages'
});

ChatMessage.associate = models => {
    ChatMessage.belongsToMany(models.Chat, {
        through: 'chatsChatMessages',
        foreignKey: 'chatMessageId',
        otherKey: 'chatId',
        as: 'chat'
    });

    ChatMessage.belongsToMany(models.User, {
        through: 'usersChatMessages',
        foreignKey: 'chatMessageId',
        otherKey: 'userId',
        as: 'user'
    });
}

module.exports = ChatMessage;