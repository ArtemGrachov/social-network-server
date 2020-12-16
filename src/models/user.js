const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');

const sequelize = require('./');

const constants = require('../constants');

const User = sequelize.define('User', {
    firstname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: Sequelize.STRING,
    country: Sequelize.STRING,
    city: Sequelize.STRING,
    phone: Sequelize.STRING,
    avatarURL: Sequelize.STRING,
    status: Sequelize.STRING
}, {
    tableName: 'users',
    indexes: [
        { type: 'FULLTEXT', name: 'text_idx', fields: ['firstname'] }
    ]
});

User.associate = models => {
    User.hasMany(models.Post, { foreignKey: 'authorId', as: 'author' });

    User.belongsToMany(
        models.User,
        {
            through: 'usersSubscriptions',
            foreignKey: 'subscriptionId',
            otherKey: 'subscriberId',
            as: {
                singular: 'subscriber',
                plural: 'subscribers'
            }
        }
    );

    User.belongsToMany(
        models.User,
        {
            through: 'usersSubscriptions',
            foreignKey: 'subscriberId',
            otherKey: 'subscriptionId',
            as: {
                singular: 'subscription',
                plural:  'subscriptions'
            }
        }
    );

    User.belongsToMany(models.Post, {
        through: 'usersPostsLikes',
        foreignKey: 'likedUserId',
        otherKey: 'likedPostId',
        as: 'likedPost'
    });

    User.hasMany(
        models.Comment,
        {
            foreignKey: 'authorId',
        }
    );

    User.belongsToMany(models.Comment, {
        through: 'usersCommentsLikes',
        foreignKey: 'likedUserId',
        otherKey: 'likedCommentId',
        as: 'likedComment'
    });
};

User.prototype.getAuthTokens = function() {
    const token = jwt.sign(
        { userId: this.id },
        constants.JWT_KEY,
        { expiresIn: constants.JWT_LIFE }
    );

    const refreshToken = jwt.sign(
        { userId: this.id },
        constants.JWT_REFRESH_KEY,
        { expiresIn: constants.JWT_REFRESH_LIFE }
    );

    return { token, refreshToken };
}

User.prototype.getResetPasswordToken = function() {
    const resetPasswordToken = jwt.sign(
        { userId: this.id },
        constants.RESET_PASSWORD_TOKEN,
        { expiresIn: constants.RESET_PASSWORD_TOKEN_LIFE }
    );

    return resetPasswordToken;
}

User.prototype.serialize = async function(userInstance) {
    const { id, firstname, lastname, country, city, phone, avatarURL, status } = this;
    const [subscriptionsCount, subscribersCount] = await Promise.all([
        this.countSubscriptions(),
        this.countSubscribers()
    ]);

    const result = {
        id,
        firstname,
        lastname,
        country,
        city,
        phone,
        avatarURL,
        status,
        subscriptionsCount,
        subscribersCount
    };


    if (!userInstance) {
        return result;
    }

    const isSubscription = await userInstance.hasSubscription(this);

    return {
        ...result,
        isSubscription
    };
}

User.prototype.serializeMin = async function(userInstance) {
    const { id, firstname, lastname, avatarURL, country, city } = this;
    const result = { id, firstname, lastname, avatarURL, country, city };

    if (!userInstance) {
        return result;
    }

    const isSubscription = await userInstance.hasSubscription(this);

    return {
        ...result,
        isSubscription
    };
}

module.exports = User;
