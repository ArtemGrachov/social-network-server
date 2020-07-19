const Sequelize = require('sequelize');
const sequelize = require('./');

const Post = sequelize.define('Post', {
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});

Post.associate = models => {
    Post.belongsTo(models.User);
    Post.belongsTo(models.Community)
}

module.exports = Post;
