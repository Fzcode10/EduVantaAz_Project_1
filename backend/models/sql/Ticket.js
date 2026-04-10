const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');

const Ticket = sequelize.define('Ticket', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
    mentorId: { type: DataTypes.INTEGER, allowNull: false, field: 'mentor_id' },
    subjectId: { type: DataTypes.STRING, allowNull: false, field: 'subject_id' },
    query: { type: DataTypes.TEXT, allowNull: false, field: 'query_text' },
    response: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('open', 'resolved'), defaultValue: 'open' }
}, {
    tableName: 'tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Ticket;
