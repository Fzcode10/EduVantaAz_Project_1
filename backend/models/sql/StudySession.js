const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');

const StudySession = sequelize.define('StudySession', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
    subjectId: { type: DataTypes.STRING, allowNull: false, field: 'subject_id' },
    durationInSeconds: { type: DataTypes.INTEGER, allowNull: false, field: 'duration_in_seconds' },
    distractionsLogged: { type: DataTypes.INTEGER, defaultValue: 0, field: 'distractions_logged' }
}, {
    tableName: 'study_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = StudySession;
