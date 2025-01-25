import dbConnect from '../../../utils/dbConnect';
import Task from '../../../models/Task';

export default async (req, res) => {
    await dbConnect();

    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            const { name, timeLogs } = req.body;
            const existingTask = await Task.findOne({ name, _id: { $ne: id } });
            if (existingTask) {
                return res.status(400).json({ message: 'Task name must be unique.' });
            }

            const task = await Task.findByIdAndUpdate(
                id,
                { name, timeLogs },
                { new: true, runValidators: true }
            );

            if (!task) {
                return res.status(404).json({ message: 'Task not found.' });
            }

            res.status(200).json(task);
        } catch (error) {
            res.status(500).json({ message: 'Failed to update task.' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const task = await Task.findByIdAndDelete(id);
            if (!task) {
                return res.status(404).json({ message: 'Task not found.' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete task.' });
        }
    } else {
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
