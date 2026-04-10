const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');

const Material = sequelize.define('Material', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    mentorId: { type: DataTypes.INTEGER, allowNull: false, field: 'mentor_id' },
    subjectId: { type: DataTypes.STRING, allowNull: false, field: 'subject_id' },
    title: { type: DataTypes.STRING, allowNull: false },
    fileType: { type: DataTypes.ENUM('pdf', 'pptx', 'mp4', 'doc', 'other'), defaultValue: 'other', field: 'file_type' },
    filePath: { type: DataTypes.TEXT, allowNull: false, field: 'file_path' },
    fileSize: { type: DataTypes.INTEGER, field: 'file_size' }
}, {
    tableName: 'materials',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Material;
