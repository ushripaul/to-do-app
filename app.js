// ---- State: one array holds every task: { id, text, done } ----
let tasks = [];
let filter = "all";
const KEY = "todo-tasks-v1";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const count = document.getElementById("count");
const filters = document.getElementById("filters");
const clearBtn = document.getElementById("clear");

// ---- Storage: JSON.stringify to save, JSON.parse to load, both guarded ----
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) { /* storage blocked or full */ }
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(data)) {
      tasks = data
        .filter(t => t && typeof t.text === "string")
        .map(t => ({ id: Number(t.id) || Date.now() + Math.random(), text: t.text, done: !!t.done }));
    }
  } catch (e) {
    tasks = []; // corrupted or missing data: start empty
  }
}

// ---- Render: rebuild the list from the array every time ----
function render() {
  list.replaceChildren();
  const visible = tasks.filter(t =>
    filter === "all" || (filter === "done" ? t.done : !t.done));

  visible.forEach(t => {
    const li = document.createElement("li");
    li.dataset.id = t.id;
    if (t.done) li.classList.add("done");

    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = t.done;
    box.setAttribute("aria-label", "Mark “" + t.text + "” complete");

    const label = document.createElement("span");
    label.textContent = t.text; // textContent, never innerHTML

    const del = document.createElement("button");
    del.type = "button";
    del.className = "del";
    del.textContent = "Delete";
    del.setAttribute("aria-label", "Delete “" + t.text + "”");

    li.append(box, label, del);
    list.append(li);
  });

  if (!visible.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = tasks.length
      ? "No tasks in this view."
      : "No tasks yet. Add your first one above.";
    list.append(empty);
  }

  const left = tasks.filter(t => !t.done).length;
  count.textContent = left + (left === 1 ? " task" : " tasks") + " left";
  clearBtn.disabled = !tasks.some(t => t.done);
  filters.querySelectorAll("button").forEach(b =>
    b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
}

// ---- Add (button click and Enter key both fire "submit") ----
form.addEventListener("submit", e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  input.value = "";
  save();
  render();
  input.focus();
});

// ---- Complete and delete: one delegated listener on the list ----
list.addEventListener("click", e => {
  const li = e.target.closest("li[data-id]");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.matches(".del")) {
    tasks = tasks.filter(t => t.id !== id);
  } else if (e.target.matches('input[type="checkbox"]')) {
    const t = tasks.find(t => t.id === id);
    if (t) t.done = e.target.checked;
  } else {
    return;
  }
  save();
  render();
});

// ---- Filters and clear completed ----
filters.addEventListener("click", e => {
  const f = e.target.dataset.filter;
  if (!f) return;
  filter = f;
  render();
});

clearBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
});

// ---- Start-up ----
load();
render();