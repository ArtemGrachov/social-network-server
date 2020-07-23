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

Post.prototype.serialize = function() {
    return {
        id: this.id,
        content: this.content,
        createdAt: this.createdAt,
        authorId: this.UserId
    }
}

module.exports = Post;
