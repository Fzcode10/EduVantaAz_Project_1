const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');

const Target = sequelize.define('Target', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
    mentorId: { type: DataTypes.INTEGER, allowNull: false, field: 'mentor_id' },
    subjectId: { type: DataTypes.STRING, allowNull: false, field: 'subject_id' },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    targetMetric: { type: DataTypes.INTEGER, defaultValue: 100, field: 'target_metric' },
    currentProgress: { type: DataTypes.INTEGER, defaultValue: 0, field: 'current_progress' },
    deadline: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'completed', 'overdue'), defaultValue: 'pending' }
}, {
    tableName: 'targets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Target;
