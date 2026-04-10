const Wellbeing = require('../models/sql/Wellbeing');

exports.saveWellbeingStatus = async (req, res) => {
    const { stress_level, sentiment_note } = req.body;
    const user_id = req.user._id;

    try {
        const newStatus = await Wellbeing.create({
            userId: user_id,
            stressLevel: Number(stress_level),
            sentimentNote: sentiment_note
        });

        res.status(201).json({ msg: "Wellbeing status saved", status: newStatus });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

exports.getWellbeingStatus = async (req, res) => {
    const user_id = req.user._id;

    try {
        const statuses = await Wellbeing.findAll({
            where: { userId: user_id },
            order: [['date', 'DESC']]
        });
        res.status(200).json(statuses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
