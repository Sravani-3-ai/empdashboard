import Bonus from '../models/bonusModel.js';

export const assignBonus = async (req, res) => {
    try {
        await Bonus.assign(req.body);
        res.status(201).json({ message: 'Bonus assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning bonus', error: error.message });
    }
};

export const getBonuses = async (req, res) => {
    const { user_id } = req.query;
    try {
        const result = user_id ? await Bonus.getByUser(user_id) : await Bonus.getAll();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bonuses', error: error.message });
    }
};
