const Activity = require('../models/activity');

exports.saveStopwatchLog = async (req, res) => {
    const { task_name, duration, focused_time, honesty_score } = req.body;
    const user_id = req.user._id;

    try {
        const newActivity = await Activity.create({
            user_id,
            task_name: task_name || "General Study",
            duration: Number(duration),
            focused_time: Number(focused_time),
            honesty_score: honesty_score ? Number(honesty_score) : Math.round((Number(focused_time) / Math.max(Number(duration), 1)) * 100)
        });

        res.status(201).json({ msg: "Stopwatch log saved successfully", activity: newActivity });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getTasks = async (req, res) => {
    const user_id = req.user._id;
    try {
        const activities = await Activity.find({ user_id }).sort({ date: -1 });
        res.status(200).json(activities);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
