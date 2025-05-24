let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let projects = JSON.parse(localStorage.getItem("projects")) || ["General"];
let filterCategory = "";

const COLORS = ["red", "green", "blue", "yellow", "purple", "pink"];
const categoryColors = {};

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("projects", JSON.stringify(projects));
}

function assignColor(category) {
  if (!categoryColors[category]) {
    const color = COLORS[Object.keys(categoryColors).length % COLORS.length];
    categoryColors[category] = color;
  }
  return categoryColors[category];
}

function addTask() {
  const taskText = document.getElementById("taskInput").value.trim();
  const selectedCat = document.getElementById("categorySelect").value;
  const newCat = document.getElementById("customCategory").value.trim();
  const dueDate = document.getElementById("dueDateInput").value;
  const selectedProject = document.getElementById("projectSelect").value;
  const newProject = document.getElementById("newProject").value.trim();

  const category = newCat || selectedCat || "General";
  const project = newProject || selectedProject || "General";

  if (!taskText) return;

  if (newProject && !projects.includes(newProject)) {
    projects.push(newProject);
  }

  tasks.push({ text: taskText, category, dueDate, done: false, project });
  assignColor(category);
  save();

  document.getElementById("taskInput").value = "";
  document.getElementById("customCategory").value = "";
  document.getElementById("dueDateInput").value = "";
  document.getElementById("newProject").value = "";

  renderTasks();
}

function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  save();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  save();
  renderTasks();
}

function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  const visibleTasks = filterCategory
    ? tasks.filter(t => t.category === filterCategory)
    : tasks;

  visibleTasks.forEach((task, index) => {
    assignColor(task.category);
    const badgeClass = categoryColors[task.category] || "default";

    const li = document.createElement("li");
    li.className = `task ${task.done ? "done" : ""}`;

    li.innerHTML = `
      <div class="task-left" onclick="toggleTask(${index})">
        <div class="circle ${task.done ? "checked" : ""}"></div>
        <div>
          <div class="task-text">${task.text}</div>
          <div class="badge ${badgeClass}">${task.category}</div>
          <small>Project: ${task.project}</small>
          ${task.dueDate ? `<small>Due: ${task.dueDate}</small>` : ""}
        </div>
      </div>
      <button onclick="deleteTask(${index})">🗑️</button>
    `;

    taskList.appendChild(li);
  });

  renderFilters();
  renderCategorySelect();
  renderProjectSelect();
}

function renderFilters() {
  const filterEl = document.getElementById("categoryFilter");
  const categories = [...new Set(tasks.map(task => task.category))];
  filterEl.innerHTML = `<button onclick="setFilter('')">All</button>`;
  categories.forEach(cat => {
    filterEl.innerHTML += `<button onclick="setFilter('${cat}')">${cat}</button>`;
  });
}

function renderCategorySelect() {
  const select = document.getElementById("categorySelect");
  const categories = [...new Set(tasks.map(task => task.category))];
  select.innerHTML = `<option value="">-- Choose Category --</option>`;
  categories.forEach(cat => {
    select.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

function renderProjectSelect() {
  const select = document.getElementById("projectSelect");
  select.innerHTML = `<option value="">-- Choose Project --</option>`;
  projects.forEach(project => {
    select.innerHTML += `<option value="${project}">${project}</option>`;
  });
}

function setFilter(category) {
  filterCategory = category;
  renderTasks();
}

renderTasks();
