document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("todo-form");
    const input = document.getElementById("todo-input");
    const todoList = document.getElementById("todo-list");
    const sidePanel = document.getElementById("side-panel");
    const panelContent = document.getElementById("panel-content");
    const closePanelBtn = document.getElementById("close-panel");
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    // Initialize Dark Mode from Local Storage
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    // Toggle Dark Mode
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");
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
            const taskDetail = `Task: ${taskName.textContent}`;
            panelContent.textContent = taskDetail;

            // Update the task title in the panel
            const taskTitleElement = document.getElementById("task-title");
            if (taskTitleElement) {
                taskTitleElement.textContent = taskName.textContent;
            }

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
});
