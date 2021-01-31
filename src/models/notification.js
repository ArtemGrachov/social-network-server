const Sequelize = require('sequelize');

const sequelize = require('./');

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

Notification.prototype.serialize = async function() {
    return this;
}

module.exports = Notification;
