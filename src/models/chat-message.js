const Sequelize = require('sequelize');
const htmlToText = require('html-to-text');

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
        foreignKey: 'chatId',
        otherKey: 'chatMessageId',
        as: 'chat'
    });

    ChatMessage.belongsTo(models.User, {
        foreignKey: 'authorId',
        as: 'author'
    });

    ChatMessage.belongsTo(models.Chat, {
        foreignKey: 'chatId'
    });
}

ChatMessage.prototype.serialize = async function() {
    const result = {
        id: this.id,
        content: this.content,
        chatId: this.chatId,
        authorId: this.authorId,
        createdAt: this.createdAt
    };

    return result;
}

module.exports = ChatMessage;
