const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');
const bcrypt = require('bcrypt');

const Staff = sequelize.define('Staff', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fullName: { type: DataTypes.STRING, allowNull: false, field: 'full_name' },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    employeeId: { type: DataTypes.STRING, unique: true, field: 'employee_id' },
    role: { type: DataTypes.ENUM('mentor', 'admin'), allowNull: false },
    department: { type: DataTypes.STRING },
    designation: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING(20) },
    password: { type: DataTypes.STRING, allowNull: false },
    isRegistered: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_registered' }
}, {
    tableName: 'staff',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// ─── Static: Register with bcrypt hash ───────────────────────────────────────
Staff.register = async function ({ fullName, email, password, role, employeeId }) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const staff = await this.create({
        fullName, email, password: hash, role, employeeId: employeeId || null
    });
    return staff;
};

// ─── Static: Login with bcrypt compare ───────────────────────────────────────
Staff.login = async function ({ email, password }) {
    const staff = await this.findOne({ where: { email } });
    if (!staff) throw Error('User does not find with this email');
    const match = await bcrypt.compare(password, staff.password);
    if (!match) throw Error('Wrong password');
    return staff;
};

module.exports = Staff;
