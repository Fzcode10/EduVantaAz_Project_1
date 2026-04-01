const mongoose = require('mongoose');

const WellbeingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentModel', required: true },
  stress_level: { type: Number, required: true, min: 1, max: 10 },
  sentiment_note: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wellbeing', WellbeingSchema);
