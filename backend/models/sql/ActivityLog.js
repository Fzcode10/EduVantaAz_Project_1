const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');

const ActivityLog = sequelize.define('ActivityLog', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
    actionType: {
        type: DataTypes.ENUM('LOGIN', 'TARGET_UPDATE', 'STUDY_SESSION_COMPLETED', 'DOUBT_LOGGED'),
        allowNull: false,
        field: 'action_type'
    },
    description: { type: DataTypes.TEXT, allowNull: false }
}, {
    tableName: 'activity_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = ActivityLog;
