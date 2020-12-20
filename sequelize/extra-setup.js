function applyExtraSetup(sequelize) {
	const {
    frequency,
    generation,
    operator,
    smartphone,
    technology,
    operator_frequency,
    operator_technology,
    smartphone_technology,
		smartphone_frequency
  } = sequelize.models;

  //Relación frecuencia-operador
	frequency.belongsToMany(operator, {
    through: {
      model: operator_frequency,
      unique:false
    }
  });
  operator.belongsToMany(frequency, {
    through: {
      model: operator_frequency,
      unique:false
    }
  });

	smartphone.hasMany(smartphone_technology);
	smartphone.hasMany(smartphone_frequency);

  generation.hasMany(frequency);
  frequency.belongsTo(generation);

  technology.belongsToMany(operator, {through: 'operator_technology'});
  operator.belongsToMany(technology, {through: 'operator_technology'});

  operator_technology.hasMany(technology);

  smartphone_technology.hasMany(technology);

}

module.exports = { applyExtraSetup };
