const Sequelize = require('sequelize');
const sequelize = require('./');

const Post = sequelize.define('Post', {
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    }
}, {
    tableName: 'posts'
});

Post.associate = models => {
    Post.belongsTo(models.User, { foreignKey: 'postId' });
    Post.belongsTo(models.Community, { foreignKey: 'postId' });
}

Post.prototype.serialize = function() {
    return {
        id: this.id,
        content: this.content,
        createdAt: this.createdAt,
        authorId: this.authorId
    }
}

module.exports = Post;
