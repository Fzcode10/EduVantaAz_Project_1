const express = require('express');
const dotenv  = require('dotenv');
const cors = require('cors');
const useStudentRouter = require('./routes/student')
const useMentroRouter = require('./routes/mentor')
const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');
const wellbeingRouter = require('./routes/wellbeing');
const adminRouter = require('./routes/admin');
const { connectSQL } = require('./dbSync');
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Single Database: MySQL only
connectSQL();

app.use('/api/student', useStudentRouter);
app.use('/api/mentor', useMentroRouter);

// New unified REST endpoints
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/wellbeing', wellbeingRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT ;

app.listen(PORT, () => {
    console.log(process.env.PORT);
    console.log(`App listen on http://localhost:${PORT}`);
})