const { DataTypes } = require('sequelize');

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
	sequelize.define('smartphone_technology', {
		// The following specification of the 'id' attribute could be omitted
		// since it is the default.
		smartphoneId: {
			type: DataTypes.INTEGER
		},
		technologyId: {
			type: DataTypes.INTEGER
		},
		compatible: {
			type: DataTypes.BOOLEAN
		}
	});
};
