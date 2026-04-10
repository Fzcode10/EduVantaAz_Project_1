const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');

const Subject = sequelize.define('Subject', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    subjectName: { type: DataTypes.STRING, allowNull: false, field: 'subject_name' },
    subjectId: { type: DataTypes.STRING, allowNull: false, unique: true, field: 'subject_id' },
    courseName: { type: DataTypes.STRING, allowNull: false, field: 'course_name' },
    semester: { type: DataTypes.INTEGER, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    department: { type: DataTypes.STRING, allowNull: false }
}, {
    tableName: 'subjects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Subject;
