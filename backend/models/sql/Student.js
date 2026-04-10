const { DataTypes } = require('sequelize');
const { sequelize } = require('../../sqlConnection');
const bcrypt = require('bcrypt');

const Student = sequelize.define('Student', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fullName: { type: DataTypes.STRING, allowNull: false, field: 'full_name' },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: false },
    dob: { type: DataTypes.DATEONLY, allowNull: false },
    enrollment: { type: DataTypes.STRING, allowNull: false, unique: true },
    rollno: { type: DataTypes.STRING, allowNull: false, unique: true },
    course: { type: DataTypes.STRING, allowNull: false },
    semester: { type: DataTypes.INTEGER, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    district: { type: DataTypes.STRING, allowNull: false },
    area: { type: DataTypes.ENUM('rural', 'urban'), allowNull: false },
    role: { type: DataTypes.STRING(20), defaultValue: 'student' },
    password: { type: DataTypes.STRING, allowNull: false },
    isRegistered: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_registered' }
}, {
    tableName: 'students',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// ─── Static: Signup with bcrypt hash ─────────────────────────────────────────
Student.signup = async function (data) {
    const { fullName, email, phone, password, gender, dob, enrollment, rollno, course, semester, state, district, area } = data;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const student = await this.create({
        fullName, email, phone, password: hash, gender, dob, enrollment, rollno, course, semester, state, district, area
    });
    return student;
};

// ─── Static: Login with bcrypt compare ───────────────────────────────────────
Student.login = async function ({ email, password }) {
    const student = await this.findOne({ where: { email } });
    if (!student) throw Error('User does not find with this email');
    const match = await bcrypt.compare(password, student.password);
    if (!match) throw Error('Wrong password');
    return student;
};

module.exports = Student;
