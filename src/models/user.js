const Sequelize = require('sequelize');
const sequelize = require('./');

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
});

User.associate = models => {
    User.hasMany(models.Post);

    User.belongsToMany(
        models.Community,
        { through: 'UsersCommunities' }
    );
};

module.exports = User;
