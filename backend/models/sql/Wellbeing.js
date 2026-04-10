const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');

const Wellbeing = sequelize.define('Wellbeing', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    stressLevel: { type: DataTypes.INTEGER, allowNull: false, field: 'stress_level' },
    sentimentNote: { type: DataTypes.STRING, field: 'sentiment_note' },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'wellbeing',
    timestamps: false
});

module.exports = Wellbeing;
