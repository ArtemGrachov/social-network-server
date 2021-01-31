const Sequelize = require('sequelize');

const sequelize = require('./');

const notificationTypes = require('../notification-types');

const Notification = sequelize.define('Notification', {
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    jsonPayload: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'notifications'
});

Notification.associate = models => {
    Notification.belongsTo(
        models.User,
        {
            foreignKey: 'ownerId',
            as: 'owner',
            allowNull: false
        }
    );
};

Notification.prototype.serialize = async function(user) {
    const payload = JSON.parse(this.jsonPayload);
    const result = { type: this.type };

    switch (this.type) {
        case notificationTypes.NEW_COMMENT: {
            const { postId, authorId } = payload;
            const [postInstance, authorInstance] = await Promise.all([
                sequelize.models.Post.findByPk(postId),
                sequelize.models.User.findByPk(authorId)
            ]);

            const [post, author] = await Promise.all([
                postInstance.serialize(user),
                authorInstance.serializeMin(user)
            ]);

            result.post = post;
            result.author = author;
            break;
        }
        case notificationTypes.NEW_LIKE: {
            const { likeAuthorId, referenceId, referenceType } = payload;

            const promises = [sequelize.models.User.findByPk(likeAuthorId)];

            switch (referenceType) {
                case 'post': {
                    promises.push(sequelize.models.Post.findByPk(referenceId));
                    break;
                }
                case 'comment': {
                    promises.push(sequelize.models.Comment.findByPk(referenceId));
                    break;
                }
            }

            const [userInstance, referenceInstance] = await Promise.all(promises);
            const [likeAuthor, reference] = await Promise.all([
                userInstance.serializeMin(user),
                referenceInstance.serialize(user)
            ]);

            result.user = likeAuthor;

            switch (referenceType) {
                case 'post': {
                    result.post = reference;
                    break;
                }
                case 'comment': {
                    result.comment = reference;
                    break;
                }
            }
            break;
        }
        case notificationTypes.NEW_SUBSCRIBER: {
            const { subscriberId } = payload;
            const subscriberInstance = await sequelize.models.User.findByPk(subscriberId);

            const subscriber = await subscriberInstance.serializeMin(user);

            result.subscriber = subscriber;
            break;
        }
    }

    return result;
}

module.exports = Notification;
