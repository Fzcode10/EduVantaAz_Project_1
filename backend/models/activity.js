const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentModel', required: true },
  task_name: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  focused_time: { type: Number, required: true }, // high focus time in minutes
  honesty_score: { type: Number },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', ActivitySchema);
