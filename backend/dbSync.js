const { sequelize } = require('./sqlConnection');

// ─── Import All Models ───────────────────────────────────────────────────────
const Student              = require('./models/sql/Student');
const Staff                = require('./models/sql/Staff');
const StaffAssignedSubject = require('./models/sql/StaffAssignedSubject');
const Subject              = require('./models/sql/Subject');
const Target               = require('./models/sql/Target');
const Recommendation       = require('./models/sql/Recommendation');
const Ticket               = require('./models/sql/Ticket');
const ActivityLog          = require('./models/sql/ActivityLog');
const StudySession         = require('./models/sql/StudySession');
const OTP                  = require('./models/sql/OTP');
const Material             = require('./models/sql/Material');
const Activity             = require('./models/sql/Activity');
const Wellbeing            = require('./models/sql/Wellbeing');

// ─── Define Associations (Foreign Keys) ──────────────────────────────────────
// Staff ↔ StaffAssignedSubject
Staff.hasMany(StaffAssignedSubject, { foreignKey: 'staff_id', as: 'assignedSubjects' });
StaffAssignedSubject.belongsTo(Staff, { foreignKey: 'staff_id' });

// Student ↔ Targets
Student.hasMany(Target, { foreignKey: 'student_id' });
Target.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Staff.hasMany(Target, { foreignKey: 'mentor_id' });
Target.belongsTo(Staff, { foreignKey: 'mentor_id', as: 'mentor' });

// Student ↔ Recommendations
Student.hasMany(Recommendation, { foreignKey: 'student_id' });
Recommendation.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Staff.hasMany(Recommendation, { foreignKey: 'mentor_id' });
Recommendation.belongsTo(Staff, { foreignKey: 'mentor_id', as: 'mentor' });

// Student ↔ Tickets
Student.hasMany(Ticket, { foreignKey: 'student_id' });
Ticket.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Staff.hasMany(Ticket, { foreignKey: 'mentor_id' });
Ticket.belongsTo(Staff, { foreignKey: 'mentor_id', as: 'mentor' });

// Student ↔ ActivityLogs
Student.hasMany(ActivityLog, { foreignKey: 'student_id' });
ActivityLog.belongsTo(Student, { foreignKey: 'student_id' });

// Student ↔ StudySessions
Student.hasMany(StudySession, { foreignKey: 'student_id' });
StudySession.belongsTo(Student, { foreignKey: 'student_id' });

// Staff ↔ Materials
Staff.hasMany(Material, { foreignKey: 'mentor_id' });
Material.belongsTo(Staff, { foreignKey: 'mentor_id', as: 'mentor' });

// Student ↔ Activities (Stopwatch)
Student.hasMany(Activity, { foreignKey: 'user_id' });
Activity.belongsTo(Student, { foreignKey: 'user_id' });

// Student ↔ Wellbeing
Student.hasMany(Wellbeing, { foreignKey: 'user_id' });
Wellbeing.belongsTo(Student, { foreignKey: 'user_id' });

// ─── Connect & Sync ─────────────────────────────────────────────────────────
const connectSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQL Database connected successfully.');

    // Auto-create all tables if they don't exist
    await sequelize.sync({ alter: false });
    console.log('All SQL tables synchronized.');

    // Setup OTP auto-purge event
    try {
      await sequelize.query(`SET GLOBAL event_scheduler = ON`);
      await sequelize.query(`
        CREATE EVENT IF NOT EXISTS purge_expired_otps
        ON SCHEDULE EVERY 1 MINUTE
        DO DELETE FROM otps WHERE created_at < NOW() - INTERVAL 10 MINUTE
      `);
      console.log('OTP auto-purge event scheduled.');
    } catch (e) {
      console.warn('OTP event scheduler setup skipped (may require SUPER privilege):', e.message);
    }

  } catch (error) {
    console.error('Unable to connect to the SQL database:', error.message);
  }
};

module.exports = { connectSQL };
