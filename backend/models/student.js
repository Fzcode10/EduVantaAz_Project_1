const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema


const studentModel = new Schema({
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
    phone: {
        type: String,   // Keep as String (important for leading 0)
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    dob: {
        type: Date,
        required: true
    },
    enrollment: {
        type: String,
        required: true,
        unique: true
    },
    rollno: {
        type: String,
        required: true,
        unique: true
    },
    course: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    area: {
        type: String,
        required: true,
        enum: ['rural', 'urban']
    },
    role: {
        type: String,
        enum: ['student'],
        default: 'student'
    },
    password: {
        type: String,
        required: true
    },
    isRegistered: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

studentModel.statics.signup = async function (data) {
    const {
        fullName,
        email,
        phone,
        password,
        gender,
        dob,
        enrollment,
        rollno,
        course,
        semester,
        state,
        district,
        area
    } = data;

    console.log(enrollment, email);

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const student = await this.create({
        fullName,
        email,
        phone,
        password: hash,
        gender,
        dob,
        enrollment,
        rollno,
        course,
        semester,
        state,
        district,
        area
    });

    console.log(student);


    return student;
}

studentModel.statics.login = async function (data) {

    const {email, password} = data;

    const student = await this.findOne({ email });

    if (!student) {
        throw Error("User does not find with this email");
    }

    const match = await bcrypt.compare(password, student.password);

    if (!match) {
        throw Error("Wrong password");
    }

    return student;
}

module.exports = mongoose.model('StudentModel', studentModel);