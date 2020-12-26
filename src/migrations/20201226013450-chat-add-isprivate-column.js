module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn(
            'chats',
            'isPrivate',
            {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            }
        );
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn(
            'chats',
            'isPrivate'
        );
    }
};
