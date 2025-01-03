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
    const taskLogs = {}; // Stores time logs for each task
    const taskElements = new Map(); // Maps task names to their list item elements

    // Initialize Dark Mode from Local Storage
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    // Toggle Dark Mode
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");

        // Ensure the side panel reflects dark mode
        sidePanel.classList.toggle("dark-mode", isDarkMode);

        // Save the preference in Local Storage
        localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    });

    // Close the Side Panel with animation
    closePanelBtn.addEventListener("click", () => {
        closeSidePanel();
    });

    function closeSidePanel() {
        sidePanel.classList.remove("active");
        setTimeout(() => {
            sidePanel.style.display = "none"; // Ensure it's fully hidden after animation
        }, 300); // Match the transition duration in CSS
    }

    // Add New Task
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent form submission
        const task = input.value.trim();
        if (task) {
            if (taskElements.has(task)) {
                alert("Task with this name already exists!");
                return;
            }
            addTask(task);
            input.value = ""; // Clear the input field
        } else {
            alert("Task cannot be empty!");
        }
    });

    // Add Task to the List with Editing and Side Panel Functionality
    function addTask(task) {
        const li = document.createElement("li");

        // Create a container for the task name
        const taskName = document.createElement("span");
        taskName.classList.add("task-name");
        taskName.textContent = task;

        // Create the Delete Button in the List
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";

        // Add event listeners for task click and delete
        taskName.addEventListener("click", handleTaskClick);
        deleteBtn.addEventListener("click", handleDeleteTask);

        // Add all elements to the List Item
        li.appendChild(taskName);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);

        // Map task to its list item element
        taskElements.set(task, li);
    }

    // Handle Task Click to Open Side Panel
    function handleTaskClick() {
        currentTask = this.textContent; // The task name that was clicked
        displayTaskInPanel(currentTask);
    }

    // Handle Task Deletion
    function handleDeleteTask() {
        const taskName = this.previousElementSibling.textContent;
        if (taskElements.has(taskName)) {
            const li = taskElements.get(taskName);
            li.remove();
            taskElements.delete(taskName);
            closeSidePanel();
        }
    }

    // Display Task in the Side Panel
    function displayTaskInPanel(task) {
        panelContent.innerHTML = ""; // Clear previous content

        // Display Task Name
        const taskLabel = document.createElement("label");
        taskLabel.textContent = "Task: ";
        const taskNameDisplay = document.createElement("span");
        taskNameDisplay.textContent = task;
        panelContent.appendChild(taskLabel);
        panelContent.appendChild(taskNameDisplay);

        // Add Edit and Delete Buttons in the Side Panel
        editTaskBtn.style.display = "inline-block";
        deleteTaskBtn.style.display = "inline-block";

        // Display existing time logs
        displayTimeLogs(task);

        // Show the side panel with animation
        sidePanel.style.display = "block"; // Make it visible first
        requestAnimationFrame(() => {
            sidePanel.classList.add("active"); // Trigger the animation
        });
    }

    // Handle Edit functionality
    editTaskBtn.addEventListener("click", () => {
        const taskNameDisplay = panelContent.querySelector("span");
    
        // Open edit mode: Replace task name with input field
        const input = document.createElement("input");
        input.type = "text";
        input.value = taskNameDisplay.textContent;
        panelContent.innerHTML = ""; // Clear previous content except time logs
        const taskLabel = document.createElement("label");
        taskLabel.textContent = "Task: ";
        panelContent.appendChild(taskLabel);
        panelContent.appendChild(input);
    
        // Preserve existing time logs when editing
        const existingTimeLogs = document.createElement("ul");
        existingTimeLogs.id = "time-logs-list";
        // NEEDS FIXING
    
        // Replace Edit button with Save button (same style)
        editTaskBtn.textContent = "Save";
        editTaskBtn.classList.add("save-button");
        editTaskBtn.classList.remove("edit-button");
    
        // Save Task Function
        const saveTask = () => {
            const updatedTask = input.value.trim();
            if (updatedTask) {
                if (taskElements.has(updatedTask) && updatedTask !== currentTask) {
                    alert("Task with this name already exists!");
                    return;
                }
                updateTask(taskNameDisplay.textContent, updatedTask, taskNameDisplay);
            } else {
                alert("Task name cannot be empty.");
            }
        };
    
        // Save when Save button is clicked
        editTaskBtn.addEventListener("click", saveTask, { once: true });
    
        // Trigger the Save function when Enter key is pressed
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                saveTask();
                editTaskBtn.removeEventListener("click", saveTask);
            }
        });
    });

    // Handle Delete functionality
    deleteTaskBtn.addEventListener("click", () => {
        if (taskElements.has(currentTask)) {
            const li = taskElements.get(currentTask);
            li.remove();
            taskElements.delete(currentTask);
            closeSidePanel();
        }
    });

    // Update Task in the List and Side Panel
    function updateTask(oldTask, newTask, taskNameDisplay) {
        if (taskElements.has(oldTask)) {
            const li = taskElements.get(oldTask);
            const taskName = li.querySelector(".task-name");

            // Update task name in the list
            taskName.textContent = newTask;

            // Re-attach event listeners
            taskName.removeEventListener("click", handleTaskClick);
            taskName.addEventListener("click", handleTaskClick);

            const deleteBtn = li.querySelector("button");
            deleteBtn.removeEventListener("click", handleDeleteTask);
            deleteBtn.addEventListener("click", handleDeleteTask);

            // Update the map
            taskElements.delete(oldTask);
            taskElements.set(newTask, li);
            currentTask = newTask;

            // Update the task name in the side panel
            taskNameDisplay.textContent = newTask;

            // Ensure the panel stays open
            displayTaskInPanel(newTask);

            // Change the "Save" button back to "Edit" button
            editTaskBtn.textContent = "Edit";
            editTaskBtn.classList.remove("save-button");
            editTaskBtn.classList.add("edit-button");
        }
    }

    // Handle Time Logging
    logTimeBtn.addEventListener("click", () => {
        const date = taskDateInput.value;
        const timeSpent = parseFloat(timeSpentInput.value);

        if (!date || isNaN(timeSpent) || timeSpent <= 0) {
            alert("Please select a date and enter a valid time.");
            return;
        }

        // Store the log for the current task
        if (!taskLogs[currentTask]) {
            taskLogs[currentTask] = [];
        }

        taskLogs[currentTask].push({ date, timeSpent });

        // Display the new log
        displayTimeLogs(currentTask);

        // Clear the inputs after logging
        taskDateInput.value = "";
        timeSpentInput.value = "";
    });

    // Display Time Logs for a Task
    function displayTimeLogs(task, logContainer = timeLogsList) {
        logContainer.innerHTML = ""; // Clear previous logs
        if (taskLogs[task]) {
            taskLogs[task].forEach(log => {
                const logItem = document.createElement("li");
                logItem.textContent = `${log.date}: ${log.timeSpent} hours`;
                logContainer.appendChild(logItem);
            });
        }
    }
});
