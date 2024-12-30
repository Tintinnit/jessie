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

    let currentTask = null;
    const taskLogs = {}; // Stores time logs for each task

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

    // Close the Side Panel
    closePanelBtn.addEventListener("click", () => {
        sidePanel.style.display = "none";
    });

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

        // Create the Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => li.remove());

        // Create the Edit Button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("edit-button");
        let isEditing = false;

        editBtn.addEventListener("click", () => {
            if (!isEditing) {
                // Enter Editing Mode
                const input = document.createElement("input");
                input.type = "text";
                input.value = taskName.textContent;
                input.classList.add("editable");
                li.replaceChild(input, taskName);
                editBtn.textContent = "Save";
                input.focus();
                isEditing = true;

                // Save changes on pressing Enter
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        saveEdit(input, taskName);
                    }
                });
            } else {
                // Save Edits
                const input = li.querySelector(".editable");
                saveEdit(input, taskName);
            }
        });

        function saveEdit(input, taskName) {
            const updatedTask = input.value.trim();
            taskName.textContent = updatedTask || taskName.textContent; // Preserve original if empty
            li.replaceChild(taskName, input);
            editBtn.textContent = "Edit";
            isEditing = false;
        }

        // Toggle the side panel
        taskName.addEventListener("click", () => {
            currentTask = taskName.textContent; // Track the current task
            const taskDetail = `Task: ${currentTask}`;
            panelContent.textContent = taskDetail;

            // Display existing time logs
            displayTimeLogs(currentTask);

            // Show the side panel
            sidePanel.style.display = "block"; // Ensure the panel is visible
            sidePanel.classList.add("active");
        });

        // Add all elements to the List Item
        li.appendChild(taskName);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
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
