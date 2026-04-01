const { DataTypes } = require('sequelize');
const { sequelize } = require('../sqlConnection');

const SubjectRequest = sequelize.define('SubjectRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  mentor_id: {
    // Storing the MongoDB Staff _id as a string reference
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed'),
    defaultValue: 'pending',
  }
}, {
  tableName: 'subject_requests',
  timestamps: true, 
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SubjectRequest;
