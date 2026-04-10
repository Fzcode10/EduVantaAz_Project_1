const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');

const OTP = sequelize.define('OTP', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false },
    otp: { type: DataTypes.STRING(10), allowNull: false },
}, {
    tableName: 'otps',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = OTP;
