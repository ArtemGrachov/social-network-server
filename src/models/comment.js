const Sequelize = require('sequelize');

const sequelize = require('./');

const Comment = sequelize.define('Comment', {
    content: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'comments'
});

Comment.associate = models => {
    Comment.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    Comment.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });

    Comment.belongsTo(
        models.Comment,
        {
            foreignKey: 'referenceId',
            as: 'reference'
        }
    );

    Comment.hasOne(
        models.Comment,
        {
            foreignKey: 'referenceId',
            as: 'answer'
        }
    );
};

Comment.prototype.serialize = function() {
    const { id, content, postId, authorId, referenceId } = this;

    return { id, content, postId, authorId, referenceId };
}

module.exports = Comment;
