const { DataTypes } = require('sequelize');

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
	sequelize.define('frequency', {
		// The following specification of the 'id' attribute could be omitted
		// since it is the default.
		name: {
			type: DataTypes.STRING
		},
		generationId: {
			type: DataTypes.INTEGER.UNSIGNED
		}
	});
};
