const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Temporary in-memory storage for tasks (since there's no MongoDB)
let tasks = [];

// Root route
app.get("/", (req, res) => {
    res.send("Welcome to the Task Management API (Local Server)");
});

// Get all tasks
app.get("/tasks", (req, res) => {
    res.json(tasks);
});

// Add new task
app.post("/tasks", (req, res) => {
    const { name } = req.body;

    // Check for duplicate task name
    if (tasks.some(task => task.name === name)) {
        return res.status(400).json({ message: "Task name must be unique." });
    }

    const newTask = { id: tasks.length + 1, name, timeLogs: [] };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// Update task
app.put("/tasks/:id", (req, res) => {
    const { name, timeLogs } = req.body;
    const taskId = parseInt(req.params.id);

    const task = tasks.find(task => task.id === taskId);
    if (!task) {
        return res.status(404).json({ message: "Task not found." });
    }

    // Check for duplicate task name (except the current one)
    if (tasks.some(t => t.name === name && t.id !== taskId)) {
        return res.status(400).json({ message: "Task name must be unique." });
    }

    task.name = name;
    task.timeLogs = timeLogs || [];
    res.json(task);
});

// Delete task
app.delete("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    tasks = tasks.filter(task => task.id !== taskId);
    res.status(204).send();
});

// Catch-all route for frontend
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
