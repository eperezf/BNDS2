const { DataTypes } = require('sequelize');

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
	sequelize.define('generation', {
		// The following specification of the 'id' attribute could be omitted
		// since it is the default.
		name: {
			type: DataTypes.STRING
		},
		description: {
			type: DataTypes.STRING
		}
	});
};
