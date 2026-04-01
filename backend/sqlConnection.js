const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Placeholder for SQL Connection
// Set your SQL_DATABASE_URL in the .env file later when you are ready.
const sqlUrl = process.env.SQL_DATABASE_URL;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false, // Set to console.log to debug SQL queries
  }
);

const connectSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQL Database connected successfully.');
    
    // Explicit model sync disabled:
    // Raw SQL tables will be managed manually via CREATE TABLE upon Subject Creation
  } catch (error) {
    console.error('Info: Unable to connect to the SQL database. (You can configure SQL_DATABASE_URL later):', error.message);
  }
};

module.exports = { sequelize, connectSQL };
