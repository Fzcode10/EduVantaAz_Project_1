const Wellbeing = require('../models/wellbeing');

exports.saveWellbeingStatus = async (req, res) => {
    const { stress_level, sentiment_note } = req.body;
    const user_id = req.user._id;

    try {
        const newStatus = await Wellbeing.create({
            user_id,
            stress_level: Number(stress_level),
            sentiment_note
        });

        res.status(201).json({ msg: "Wellbeing status saved", status: newStatus });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

exports.getWellbeingStatus = async (req, res) => {
    const user_id = req.user._id;

    try {
        const statuses = await Wellbeing.find({ user_id }).sort({ date: -1 });
        res.status(200).json(statuses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
