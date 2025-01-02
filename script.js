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
        deleteBtn.addEventListener("click", () => {
            li.remove();
            taskElements.delete(task);
            if (currentTask === task) {
                closeSidePanel();
            }
        });

        // Add the task name click event to open the side panel
        taskName.addEventListener("click", () => {
            currentTask = task;
            displayTaskInPanel(task);
        });

        // Add all elements to the List Item
        li.appendChild(taskName);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);

        // Map task to its list item element
        taskElements.set(task, li);
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
        console.log('Edit button clicked');
        const taskNameDisplay = panelContent.querySelector("span");

        // Open edit mode: Replace task name with input field
        const input = document.createElement("input");
        input.type = "text";
        input.value = taskNameDisplay.textContent;
        panelContent.innerHTML = ""; // Clear previous content
        const taskLabel = document.createElement("label");
        taskLabel.textContent = "Task: ";
        panelContent.appendChild(taskLabel);
        panelContent.appendChild(input);

        // Replace Edit button with Save button (same style)
        editTaskBtn.textContent = "Save";
        editTaskBtn.classList.add("save-button");
        editTaskBtn.classList.remove("edit-button");

        // Save Button functionality
        editTaskBtn.addEventListener("click", () => {
            const updatedTask = input.value.trim();
            if (updatedTask) {
                updateTask(taskNameDisplay.textContent, updatedTask, taskNameDisplay);
            }
        });
    });

    // Handle Delete functionality
    deleteTaskBtn.addEventListener("click", () => {
        console.log('Delete button clicked');
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
            taskName.textContent = newTask;
            taskElements.delete(oldTask);
            taskElements.set(newTask, li);
            currentTask = newTask;

            // Update task name in the side panel
            taskNameDisplay.textContent = newTask;

            // Ensure the panel stays open for further edits
            displayTaskInPanel(newTask);
            
            // Change the "Save" button back to "Edit" button
            editTaskBtn.textContent = "Edit";
            editTaskBtn.classList.remove("save-button");
            editTaskBtn.classList.add("edit-button");

            // Reattach the Edit event listener after saving
            editTaskBtn.addEventListener("click", () => {
                editTaskBtn.textContent = "Save";
                editTaskBtn.classList.add("save-button");
                editTaskBtn.classList.remove("edit-button");

                const input = document.createElement("input");
                input.type = "text";
                input.value = taskName.textContent;
                panelContent.innerHTML = "";
                const taskLabel = document.createElement("label");
                taskLabel.textContent = "Task: ";
                panelContent.appendChild(taskLabel);
                panelContent.appendChild(input);

                // Save Button functionality
                editTaskBtn.addEventListener("click", () => {
                    const updatedTask = input.value.trim();
                    if (updatedTask) {
                        updateTask(taskName.textContent, updatedTask, taskName);
                    }
                });
            });
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
    function displayTimeLogs(task) {
        timeLogsList.innerHTML = ""; // Clear previous logs
        if (taskLogs[task]) {
            taskLogs[task].forEach(log => {
                const logItem = document.createElement("li");
                logItem.textContent = `${log.date}: ${log.timeSpent} hours`;
                timeLogsList.appendChild(logItem);
            });
        }
    }
});
