const { DataTypes } = require('sequelize');

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
	sequelize.define('smartphone', {
		// The following specification of the 'id' attribute could be omitted
		// since it is the default.
		brand: {
			type: DataTypes.STRING
		},
		model: {
			type: DataTypes.STRING
		},
    variant: {
			type: DataTypes.STRING
		},
    fullName: {
			type: DataTypes.STRING
		},
    reviewUrl: {
			type: DataTypes.STRING
		},
		imageUrl: {
			type: DataTypes.STRING
		},
		visible: {
			type: DataTypes.BOOLEAN
		},
	});
};
