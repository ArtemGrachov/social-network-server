const { Sequelize } = require('sequelize');

module.exports = function(fieldName, value) {
    return {
        [fieldName]: {
            [Sequelize.Op.like]: `%${value}%`
        }
    };
}
