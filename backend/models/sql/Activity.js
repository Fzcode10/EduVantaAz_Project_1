const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');

const Activity = sequelize.define('Activity', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    taskName: { type: DataTypes.STRING, allowNull: false, field: 'task_name' },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    focusedTime: { type: DataTypes.INTEGER, allowNull: false, field: 'focused_time' },
    honestyScore: { type: DataTypes.INTEGER, field: 'honesty_score' },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'activities',
    timestamps: false
});

module.exports = Activity;
