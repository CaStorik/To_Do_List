const API_BASE_URL = "http://localhost:3000/api";
const ITEMS_PER_PAGE = 5;

const taskInput = document.getElementById("task-input");
const taskDescription = document.getElementById("task-description");
const taskPriority = document.getElementById("task-priority");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const totalTasks = document.getElementById("total-tasks");
const completedTasks = document.getElementById("completed-tasks");
const errorMessage = document.getElementById("error-message");
const filterButtons = document.querySelectorAll(".filter-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");
const editModal = document.getElementById("edit-modal");
const editTitle = document.getElementById("edit-title");
const editDescription = document.getElementById("edit-description");
const editPriority = document.getElementById("edit-priority");
const editCompleted = document.getElementById("edit-completed");
const saveEditBtn = document.getElementById("save-edit");
const cancelEditBtn = document.getElementById("cancel-edit");
const closeModalBtn = document.getElementById("close-modal");

let tasks = [];
let currentFilter = "all";
let currentPage = 1;
let totalPages = 1;
let totalTaskCount = 0;
let currentEditingTask = null;

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    setupEventListeners();
});

function setupEventListeners() {
    addBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addTask();
    });

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            loadTasks();
        });
    });

    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            loadTasks();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadTasks();
        }
    });

    saveEditBtn.addEventListener("click", saveTaskEdit);
    cancelEditBtn.addEventListener("click", closeEditModal);
    closeModalBtn.addEventListener("click", closeEditModal);

    editModal.addEventListener("click", (e) => {
        if (e.target === editModal) closeEditModal();
    });
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 3000);
}

async function loadTasks() {
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
        });

        if (currentFilter === "active") {
            params.append("completed", "false");
        } else if (currentFilter === "completed") {
            params.append("completed", "true");
        }

        const response = await fetch(`${API_BASE_URL}/tasks?${params}`);
        if (!response.ok) throw new Error("Ошибка загрузки задач");

        const data = await response.json();
        tasks = data.tasks || [];
        totalTaskCount = data.total || 0;
        totalPages = data.totalPages || 1;

        renderTasks();
        updateStats();
        updatePagination();
    } catch (error) {
        showError(error.message);
        taskList.innerHTML = '<li class="loading">Ошибка загрузки задач</li>';
    }
}

async function addTask() {
    const title = taskInput.value.trim();
    const description = taskDescription.value.trim();
    const priority = taskPriority.value;

    if (!title) return;

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                description: description || "",
                priority,
            }),
        });

        if (!response.ok) throw new Error("Ошибка добавления задачи");

        taskInput.value = "";
        taskDescription.value = "";
        currentPage = 1;
        loadTasks();
    } catch (error) {
        showError(error.message);
    }
}

function openEditModal(task) {
    currentEditingTask = task;
    editTitle.value = task.title;
    editDescription.value = task.description || "";
    editPriority.value = task.priority || "medium";
    editCompleted.checked = task.completed || false;
    editModal.style.display = "flex";
}

function closeEditModal() {
    editModal.style.display = "none";
    currentEditingTask = null;
}

async function saveTaskEdit() {
    if (!currentEditingTask) return;

    const title = editTitle.value.trim();
    if (!title) {
        showError("Название задачи не может быть пустым");
        return;
    }

    try {
        const updates = {
            title,
            description: editDescription.value.trim(),
            priority: editPriority.value,
            completed: editCompleted.checked,
        };

        const response = await fetch(
            `${API_BASE_URL}/tasks/${currentEditingTask.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            }
        );

        if (!response.ok) throw new Error("Ошибка обновления задачи");

        closeEditModal();
        loadTasks();
    } catch (error) {
        showError(error.message);
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) throw new Error("Ошибка удаления задачи");

        loadTasks();
    } catch (error) {
        showError(error.message);
    }
}

async function toggleTaskCompletion(id, completed) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ completed }),
        });

        if (!response.ok) throw new Error("Ошибка обновления задачи");

        loadTasks();
    } catch (error) {
        showError(error.message);
    }
}

function renderTasks() {
    if (tasks.length === 0) {
        taskList.innerHTML = '<li class="loading">Задачи не найдены</li>';
        return;
    }

    taskList.innerHTML = tasks
        .map(
            (task) => `
                <li class="task-item ${
                    task.completed ? "task-completed" : ""
                }" data-id="${task.id}">
                    <input type="checkbox" class="task-checkbox" ${
                        task.completed ? "checked" : ""
                    }>
                    <div class="task-content">
                        <span class="task-text">${task.title}</span>
                        ${
                            task.description
                                ? `<p class="task-description">${task.description}</p>`
                                : ""
                        }
                    </div>
                    ${
                        task.priority
                            ? `<span class="task-priority priority-${
                                  task.priority
                              }">${getPriorityText(task.priority)}</span>`
                            : ""
                    }
                    <div class="task-actions">
                        <button class="task-btn edit-btn"><i class="fas fa-edit"></i></button>
                        <button class="task-btn delete-btn"><i class="fas fa-trash"></i></button>
                    </div>
                </li>
            `
        )
        .join("");

    document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
            const taskId = e.target.closest(".task-item").dataset.id;
            toggleTaskCompletion(taskId, e.target.checked);
        });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const taskId = e.target.closest(".task-item").dataset.id;
            if (confirm("Вы уверены, что хотите удалить эту задачу?")) {
                deleteTask(taskId);
            }
        });
    });

    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const taskId = e.target.closest(".task-item").dataset.id;
            const task = tasks.find((t) => t.id == taskId);
            if (task) {
                openEditModal(task);
            }
        });
    });
}

function getPriorityText(priority) {
    const priorityMap = {
        low: "Низкий",
        medium: "Средний",
        high: "Высокий",
    };
    return priorityMap[priority] || priority;
}

function updateStats() {
    totalTasks.textContent = totalTaskCount;
    completedTasks.textContent = tasks.filter((task) => task.completed).length;
}

function updatePagination() {
    pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}
