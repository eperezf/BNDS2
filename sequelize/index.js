const { Sequelize } = require('sequelize');
const { applyExtraSetup } = require('./extra-setup');

// In a real app, you should keep the database connection URL as an environment variable.
// But for this example, we will just use a local SQLite database.
// const sequelize = new Sequelize(process.env.DB_CONNECTION_URL);
const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASS,
	{
		logging: false,
		host: process.env.DB_ENDPOINT,
		dialect:'mysql',
		define: {freezeTableName: true}
	}
);

const modelDefiners = [
	require('./models/operator'),
	require('./models/smartphone'),
  require('./models/generation'),
  require('./models/frequency'),
  require('./models/technology'),
  require('./models/operator_frequency'),
  require('./models/operator_technology'),
  require('./models/smartphone_technology'),
  require('./models/smartphone_frequency'),
];

// We define all models according to their files.
for (const modelDefiner of modelDefiners) {
	modelDefiner(sequelize);
}

// We execute any extra setup after the models are defined, such as adding associations.
applyExtraSetup(sequelize);

// We export the sequelize connection instance to be used around our app.
module.exports = sequelize;
