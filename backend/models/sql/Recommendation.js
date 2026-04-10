const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');

const Recommendation = sequelize.define('Recommendation', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
    mentorId: { type: DataTypes.INTEGER, allowNull: false, field: 'mentor_id' },
    subjectId: { type: DataTypes.STRING, allowNull: false, field: 'subject_id' },
    predictionText: { type: DataTypes.TEXT, allowNull: false, field: 'prediction_text' },
    status: { type: DataTypes.ENUM('pending', 'approved', 'refined', 'rejected'), defaultValue: 'pending' },
    refinedText: { type: DataTypes.TEXT, field: 'refined_text' },
    feedbackGiven: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'feedback_given' }
}, {
    tableName: 'recommendations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Recommendation;
