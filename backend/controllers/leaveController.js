import Leave from '../models/leaveModel.js';

export const applyLeave = async (req, res) => {
    try {
        await Leave.apply(req.body);
        res.status(201).json({ message: 'Leave application submitted' });
    } catch (error) {
        res.status(500).json({ message: 'Error applying for leave', error: error.message });
    }
};

export const getLeaves = async (req, res) => {
    const { user_id } = req.query;
    try {
        const result = user_id ? await Leave.getByUser(user_id) : await Leave.getAll();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaves', error: error.message });
    }
};

export const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await Leave.updateStatus(id, status);
        res.status(200).json({ message: 'Leave status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating leave status', error: error.message });
    }
};
