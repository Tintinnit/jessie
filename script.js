document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("todo-form");
    const input = document.getElementById("todo-input");
    const todoList = document.getElementById("todo-list");

    // Add a new task
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const task = input.value.trim();
        if (task) {
            addTask(task);
            input.value = ""; // Clear the input field
        }
    });

   // Add task to the list with inline editing functionality
    function addTask(task) {
        const li = document.createElement("li");

        // Create a container for the task name
        const taskName = document.createElement("span");
        taskName.classList.add("task-name");
        taskName.textContent = task;

        // Create the delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => li.remove());

        // Create the edit button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("edit-button");
        let isEditing = false;

        editBtn.addEventListener("click", () => {
            if (!isEditing) {
                // Switch to editing mode
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
                // Save edits
                const input = li.querySelector(".editable");
                saveEdit(input, taskName);
            }
        });

        function saveEdit(input, taskName) {
            taskName.textContent = input.value.trim() || "Untitled Task";
            li.replaceChild(taskName, input);
            editBtn.textContent = "Edit";
            isEditing = false;
        }

        // Add all elements to the list item
        li.appendChild(taskName);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        todoList.appendChild(li);
    }
});
