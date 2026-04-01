const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const staffModel = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['mentor', 'admin'],
        required: true
    },
    // Supplemented later
    department: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    isRegistered: {
        type: Boolean,
        default: false
    },
    assignedSubjects: [
        {
            subjectName: { type: String },
            subjectId:   { type: String }
        }
    ],
}, { timestamps: true });

staffModel.statics.register = async function (data) {
    const { fullName, email, password, role, employeeId } = data;
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const staff = await this.create({
        fullName,
        email,
        password: hash,
        role,
        employeeId: employeeId || undefined
    });
    
    return staff;
}

staffModel.statics.login = async function (data) {
    const {email, password} = data;

    const staff = await this.findOne({ email });

    if (!staff) {
        throw Error("User does not find with this email");
    }

    const match = await bcrypt.compare(password, staff.password);

    if (!match) {
        throw Error("Wrong password");
    }

    return staff;
}

module.exports = mongoose.model('StaffModel', staffModel);
