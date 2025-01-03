const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/task-manager', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Task Schema
const taskSchema = new mongoose.Schema({
    name: String,
    timeLogs: [{ date: String, timeSpent: Number }],
});
const Task = mongoose.model('Task', taskSchema);

// Routes
// Get all tasks
app.get('/tasks', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

// Add new task
app.post('/tasks', async (req, res) => {
    const { name } = req.body;
    const newTask = new Task({ name, timeLogs: [] });
    await newTask.save();
    res.status(201).json(newTask);
});

// Update task
app.put('/tasks/:id', async (req, res) => {
    const { name, timeLogs } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { name, timeLogs }, { new: true });
    res.json(task);
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
