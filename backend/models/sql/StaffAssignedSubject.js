const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');

const StaffAssignedSubject = sequelize.define('StaffAssignedSubject', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    staffId: { type: DataTypes.INTEGER, allowNull: false, field: 'staff_id' },
    subjectName: { type: DataTypes.STRING, allowNull: false, field: 'subject_name' },
    subjectId: { type: DataTypes.STRING, allowNull: false, field: 'subject_id' }
}, {
    tableName: 'staff_assigned_subjects',
    timestamps: false
});

module.exports = StaffAssignedSubject;
