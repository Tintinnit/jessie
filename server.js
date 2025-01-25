const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();

// MongoDB connection
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connected!");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Task Schema
const taskSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    timeLogs: [{ date: String, timeSpent: Number }],
});
const Task = mongoose.model('Task', taskSchema);

// Routes
// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Task Management API');
});

// Get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tasks.' });
    }
});

// Add new task
app.post('/tasks', async (req, res) => {
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
});

// Update task
app.put('/tasks/:id', async (req, res) => {
    try {
        const { name, timeLogs } = req.body;

        // Check for duplicate name in tasks other than the current one
        const existingTask = await Task.findOne({ name, _id: { $ne: req.params.id } });
        if (existingTask) {
            return res.status(400).json({ message: 'Task name must be unique.' });
        }

        // Update the task
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { name, timeLogs },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update task.' });
    }
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete task.' });
    }
});

// Catch-all route for frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
