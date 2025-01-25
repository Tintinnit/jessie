import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    timeLogs: [{ date: String, timeSpent: Number }],
});

export default mongoose.models.Task || mongoose.model('Task', taskSchema);
