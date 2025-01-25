import dbConnect from '../../utils/dbConnect';
import Task from '../../models/Task';

export default async (req, res) => {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const tasks = await Task.find();
            res.status(200).json(tasks);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch tasks.' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name } = req.body;
            const newTask = new Task({ name, timeLogs: [] });
            await newTask.save();
            res.status(201).json(newTask);
        } catch (error) {
            if (error.code === 11000) {
                res.status(400).json({ message: 'Task name must be unique.' });
            } else {
                res.status(500).json({ message: 'Failed to add task.' });
            }
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
