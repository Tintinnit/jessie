document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("todo-form");
    const input = document.getElementById("todo-input");
    const todoList = document.getElementById("todo-list");
    const sidePanel = document.getElementById("side-panel");
    const panelContent = document.getElementById("panel-content");
    const closePanelBtn = document.getElementById("close-panel");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const taskDateInput = document.getElementById("task-date");
    const timeSpentInput = document.getElementById("time-spent");
    const logTimeBtn = document.getElementById("log-time-btn");
    const timeLogsList = document.getElementById("time-logs-list");
    const editTaskBtn = document.getElementById("edit-task-btn");
    const deleteTaskBtn = document.getElementById("delete-task-btn");

    let currentTask = null;

    const API_BASE = "http://localhost:3000/tasks";

    // Initialize Dark Mode from Local Storage
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    // Toggle Dark Mode
    darkModeToggle.addEventListener("click", () => {
        const isDarkMode = document.body.classList.toggle("dark-mode");
        sidePanel.classList.toggle("dark-mode", isDarkMode);
        localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    });

    // Close the Side Panel
    closePanelBtn.addEventListener("click", closeSidePanel);
    function closeSidePanel() {
        sidePanel.classList.remove("active");
        setTimeout(() => {
            sidePanel.style.display = "none";
        }, 300);
    }

    // Load tasks on page load
    async function loadTasks() {
        try {
            const response = await fetch(API_BASE);
            const tasks = await response.json();
            tasks.forEach(task => addTaskToDOM(task));
        } catch (error) {
            console.error("Error loading tasks:", error);
        }
    }
    loadTasks();

    // Helper: Check for duplicate task name
    function isDuplicateTaskName(name) {
        return [...todoList.children].some(
            (li) => li.querySelector(".task-name").textContent === name
        );
    }

    // Add new task
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const taskName = input.value.trim();
        if (taskName) {
            if (isDuplicateTaskName(taskName)) {
                alert("Task name must be unique.");
                return;
            }
            try {
                const response = await fetch(API_BASE, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: taskName }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    alert(error.message);
                    return;
                }

                const newTask = await response.json();
                addTaskToDOM(newTask);
                input.value = "";
            } catch (error) {
                console.error("Error adding task:", error);
            }
        } else {
            alert("Task name cannot be empty!");
        }
    });

    // Add task to DOM
    function addTaskToDOM(task) {
        const li = document.createElement("li");
    
        const taskContainer = document.createElement("div");
        taskContainer.classList.add("task-container");
    
        const taskName = document.createElement("span");
        taskName.textContent = task.name;
        taskName.classList.add("task-name");
    
        const totalTime = document.createElement("span");
        totalTime.textContent = `${calculateTotalTime(task.timeLogs)} hours`;
        totalTime.classList.add("task-total-time");
    
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to delete this task?")) {
                deleteTask(task._id, li);
            }
        });
    
        taskName.addEventListener("click", () => displayTaskInPanel(task));
    
        taskContainer.appendChild(taskName);
        taskContainer.appendChild(totalTime);
    
        li.appendChild(taskContainer);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    }    

    // Calculate total time from time logs
    function calculateTotalTime(logs) {
        return logs.reduce((sum, log) => sum + log.timeSpent, 0);
    }

    // Delete task
    async function deleteTask(taskId, li) {
        try {
            await fetch(`${API_BASE}/${taskId}`, { method: "DELETE" });
            li.remove();
            if (currentTask && currentTask._id === taskId) {
                closeSidePanel();
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }

    // Display task in side panel
    function displayTaskInPanel(task) {
        currentTask = task;

        // Update panel content
        panelContent.innerHTML = `<label>Task: <span>${task.name}</span></label>`;
        displayTimeLogs(task.timeLogs || []);

        // Show the side panel
        sidePanel.style.display = "block";
        requestAnimationFrame(() => sidePanel.classList.add("active"));

        // Update button handlers
        editTaskBtn.onclick = () => editTask(task);

        deleteTaskBtn.onclick = () => {
            if (confirm("Are you sure you want to delete this task?")) {
                // Find the task's corresponding DOM element in the list
                const taskElement = [...todoList.children].find(li => 
                    li.querySelector(".task-name")?.textContent === task.name
                );

                if (taskElement) {
                    deleteTask(task._id, taskElement); // Pass the correct DOM element
                }
            }
        };
    }

    // Edit task
    async function editTask(task) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = task.name;
    
        // Clear panel content and set up for editing
        panelContent.innerHTML = `<label>Task: </label>`;
        panelContent.appendChild(input);
    
        editTaskBtn.textContent = "Save";
    
        // Automatically focus on the input field and place the cursor at the end of the text
        input.focus();
        input.setSelectionRange(task.name.length, task.name.length);
    
        async function saveTask() {
            const updatedName = input.value.trim();
            if (updatedName) {
                if (
                    updatedName !== task.name && // Skip check if name is unchanged
                    isDuplicateTaskName(updatedName)
                ) {
                    alert("Task name must be unique.");
                    return;
                }
                try {
                    const response = await fetch(`${API_BASE}/${task._id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: updatedName, timeLogs: task.timeLogs || [] }),
                    });
    
                    if (!response.ok) {
                        const error = await response.json();
                        alert(error.message);
                        return;
                    }
    
                    const updatedTask = await response.json();
    
                    // Update the task in the DOM immediately
                    const taskElement = [...todoList.children].find((li) =>
                        li.querySelector(".task-name")?.textContent === task.name
                    );
                    if (taskElement) {
                        taskElement.querySelector(".task-name").textContent = updatedTask.name;
                    }
    
                    // Update local task data
                    task.name = updatedTask.name;
                    task.timeLogs = updatedTask.timeLogs;
                    displayTaskInPanel(task);
                    editTaskBtn.textContent = "Edit";
                } catch (error) {
                    console.error("Error editing task:", error);
                }
            } else {
                alert("Task name cannot be empty!");
            }
        }
    
        // Save the task when the "Save" button is clicked
        editTaskBtn.onclick = saveTask;
    
        // Save the task when "Enter" is pressed
        input.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                saveTask();
            }
        });
    }      

    // Log time button functionality
    logTimeBtn.addEventListener("click", async () => {
        if (!currentTask) return;
        const date = taskDateInput.value;
        const timeSpent = parseFloat(timeSpentInput.value);

        if (!date || isNaN(timeSpent) || timeSpent <= 0) {
            alert("Please select a valid date and enter a valid time.");
            return;
        }

        currentTask.timeLogs = currentTask.timeLogs || [];
        currentTask.timeLogs.push({ date, timeSpent });

        try {
            await fetch(`${API_BASE}/${currentTask._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentTask),
            });
            displayTimeLogs(currentTask.timeLogs);

            // Update total time display
            const taskElement = [...todoList.children].find((li) =>
                li.querySelector(".task-name")?.textContent === currentTask.name
            );
            if (taskElement) {
                const totalTimeSpan = taskElement.querySelector(".task-total-time");
                if (totalTimeSpan) {
                    totalTimeSpan.textContent = `${calculateTotalTime(currentTask.timeLogs)} hours`;
                }
            }

            taskDateInput.value = "";
            timeSpentInput.value = "";
        } catch (error) {
            console.error("Error logging time:", error);
        }
    });

    // Display time logs
    function displayTimeLogs(logs) {
        timeLogsList.innerHTML = logs
            .map(log => `<li>${log.date}: ${log.timeSpent} hours</li>`)
            .join("");
    }
});
