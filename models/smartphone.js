'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class smartphone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  smartphone.init({
    brand: DataTypes.STRING,
    model: DataTypes.STRING,
    variant: DataTypes.STRING,
    fullname: DataTypes.STRING,
    reviewUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'smartphone',
  });
  return smartphone;
};
