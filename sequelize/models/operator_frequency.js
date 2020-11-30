const { DataTypes } = require('sequelize');

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
	sequelize.define('operator_frequency', {
		// The following specification of the 'id' attribute could be omitted
		// since it is the default.
		operatorId: {
			type: DataTypes.INTEGER
		},
		frequencyId: {
			type: DataTypes.INTEGER
		},
		compatible: {
			type: DataTypes.BOOLEAN
		},
		roaming: {
			type: DataTypes.BOOLEAN
		},
		providerId: {
			type: DataTypes.INTEGER
		},
	});
};
