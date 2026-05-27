const form = document.querySelector("#note-form");
const input = document.querySelector("#note-input");
const categoryInput = document.querySelector("#category-input");
const list = document.querySelector("#note-list");
const noteCount = document.querySelector("#note-count");
const noteSearch = document.querySelector("#note-search");
const clearButton = document.querySelector("#clear-button");
const undoButton = document.querySelector("#undo-button");
const exportButton = document.querySelector("#export-button");
const noteImportInput = document.querySelector("#note-import-input");
const loadSharedNotesButton = document.querySelector("#load-shared-notes-button");
const exportSharedDataButton = document.querySelector("#export-shared-data-button");
const filterButtons = document.querySelectorAll(".filter-button");
const weatherTemp = document.querySelector("#weather-temp");
const weatherHumidity = document.querySelector("#weather-humidity");
const weatherRain = document.querySelector("#weather-rain");
const weatherUpdated = document.querySelector("#weather-updated");
const wheelsForm = document.querySelector("#wheels-form");
const wheelsInput = document.querySelector("#wheels-input");
const wheelsCategoryInput = document.querySelector("#wheels-category-input");
const wheelsList = document.querySelector("#wheels-list");
const wheelsCount = document.querySelector("#wheels-count");
const wheelsSearch = document.querySelector("#wheels-search");
const wheelsClearButton = document.querySelector("#wheels-clear-button");
const wheelsUndoButton = document.querySelector("#wheels-undo-button");
const wheelsExportButton = document.querySelector("#wheels-export-button");
const wheelsImportInput = document.querySelector("#wheels-import-input");
const loadSharedWheelsButton = document.querySelector("#load-shared-wheels-button");
const wheelsFilterButtons = document.querySelectorAll(".wheels-filter-button");

const starterNotes = [
  { text: "Open this file in a browser", category: "Task" },
  { text: "Edit the heading in index.html", category: "Task" },
  { text: "Change a color in styles.css", category: "Idea" },
];

let notes = getSavedNotes();
let notesBeforeClear = [];
let currentFilter = "All";
let currentSearch = "";
let wheelsEntries = getSavedWheelsEntries();
let wheelsEntriesBeforeClear = [];
let wheelsCurrentFilter = "All";
let wheelsCurrentSearch = "";

async function loadShanghaiWeather() {
  const weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=31.2181&longitude=121.4246&current=temperature_2m,relative_humidity_2m&hourly=precipitation_probability&forecast_days=1&timezone=Asia%2FShanghai";

  try {
    const response = await fetch(weatherUrl);
    const weather = await response.json();
    const currentTime = weather.current.time;
    const rainIndex = weather.hourly.time.findIndex(function (time) {
      return time === currentTime.slice(0, 13) + ":00";
    });
    const rainChance = weather.hourly.precipitation_probability[rainIndex] ?? 0;

    weatherTemp.textContent = Math.round(weather.current.temperature_2m);
    weatherHumidity.textContent = weather.current.relative_humidity_2m;
    weatherRain.textContent = rainChance;
    weatherUpdated.textContent = `Updated ${formatEntryTime(currentTime)}`;
  } catch (error) {
    weatherUpdated.textContent = "Weather unavailable. Check your connection and refresh.";
  }
}

function getSavedNotes() {
  const savedNotes = JSON.parse(localStorage.getItem("notes"));

  if (!savedNotes) {
    return starterNotes;
  }

  return savedNotes.map(function (note) {
    if (typeof note === "string") {
      return { text: note, category: "Idea" };
    }

    return note;
  });
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

async function loadSharedData() {
  const response = await fetch("data.json");
  return response.json();
}

function downloadTextFile(filename, text, fileType) {
  const file = new Blob([text], { type: fileType });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(file);
  link.download = filename;
  link.click();

  URL.revokeObjectURL(link.href);
}

function updateNoteCount() {
  const visibleNotes = getVisibleNotes();
  const noteLabel = visibleNotes.length === 1 ? "note" : "notes";
  noteCount.textContent = `${visibleNotes.length} ${noteLabel} shown`;
}

function getVisibleNotes() {
  return notes.filter(function (note) {
    const matchesFilter = currentFilter === "All" || note.category === currentFilter;
    const matchesSearch = note.text.toLowerCase().includes(currentSearch);

    return matchesFilter && matchesSearch;
  });
}

function renderNotes() {
  list.innerHTML = "";

  getVisibleNotes().forEach(function (note) {
    const newNote = document.createElement("li");
    const noteText = document.createElement("span");
    const categoryBadge = document.createElement("span");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    noteText.textContent = note.text;
    noteText.className = "note-text";

    categoryBadge.textContent = note.category;
    categoryBadge.className = "category-badge";

    editButton.textContent = "Edit";
    editButton.className = "edit-button";

    editButton.addEventListener("click", function () {
      const updatedText = prompt("Edit this note:", note.text);

      if (updatedText === null || updatedText.trim() === "") {
        return;
      }

      note.text = updatedText.trim();
      saveNotes();
      renderNotes();
    });

    deleteButton.textContent = "Remove";
    deleteButton.className = "remove-button";

    deleteButton.addEventListener("click", function () {
      const index = notes.indexOf(note);
      notes.splice(index, 1);
      saveNotes();
      renderNotes();
    });

    newNote.appendChild(categoryBadge);
    newNote.appendChild(noteText);
    newNote.appendChild(editButton);
    newNote.appendChild(deleteButton);
    list.appendChild(newNote);
  });

  updateNoteCount();
}

function addNote(noteText, category) {
  notes.push({ text: noteText, category: category });
  saveNotes();
  renderNotes();
}

function parseNotesMarkdown(markdown) {
  const importedNotes = [];
  const lines = markdown.split(/\r?\n/);

  lines.forEach(function (line) {
    const noteMatch = line.match(/^- \*\*(Idea|Task|Article):\*\* (.+)$/);

    if (!noteMatch) {
      return;
    }

    importedNotes.push({
      category: noteMatch[1],
      text: noteMatch[2],
    });
  });

  return importedNotes;
}

renderNotes();

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(function (filterButton) {
      filterButton.classList.remove("active");
    });

    button.classList.add("active");
    renderNotes();
  });
});

noteSearch.addEventListener("input", function () {
  currentSearch = noteSearch.value.trim().toLowerCase();
  renderNotes();
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const noteText = input.value.trim();
  const category = categoryInput.value;

  if (noteText === "") {
    return;
  }

  addNote(noteText, category);
  undoButton.hidden = true;

  input.value = "";
  input.focus();
});

clearButton.addEventListener("click", function () {
  notesBeforeClear = notes.slice();
  notes = [];
  saveNotes();
  renderNotes();
  undoButton.hidden = notesBeforeClear.length === 0;
});

undoButton.addEventListener("click", function () {
  notes = notesBeforeClear.slice();
  notesBeforeClear = [];
  saveNotes();
  renderNotes();
  undoButton.hidden = true;
});

exportButton.addEventListener("click", function () {
  const markdownLines = ["# My Notes", ""];

  notes.forEach(function (note) {
    markdownLines.push(`- **${note.category}:** ${note.text}`);
  });

  const markdown = markdownLines.join("\n");
  downloadTextFile("my-notes.md", markdown, "text/markdown");
});

noteImportInput.addEventListener("change", function () {
  const file = noteImportInput.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", function () {
    const importedNotes = parseNotesMarkdown(reader.result);

    if (importedNotes.length === 0) {
      alert("No Dashboard notes were found in that file.");
      noteImportInput.value = "";
      return;
    }

    notes = notes.concat(importedNotes);
    saveNotes();
    renderNotes();
    noteImportInput.value = "";
  });

  reader.readAsText(file);
});

loadSharedNotesButton.addEventListener("click", async function () {
  try {
    const sharedData = await loadSharedData();
    const sharedNotes = sharedData.notes || [];

    notes = notes.concat(sharedNotes);
    saveNotes();
    renderNotes();
  } catch (error) {
    alert("Shared notes could not be loaded.");
  }
});

exportSharedDataButton.addEventListener("click", function () {
  const sharedData = {
    notes: notes,
    wheelsEntries: wheelsEntries,
  };
  const json = JSON.stringify(sharedData, null, 2);

  downloadTextFile("data.json", json, "application/json");
});

function saveWheelsEntries() {
  localStorage.setItem("wheelsEntries", JSON.stringify(wheelsEntries));
}

function getSavedWheelsEntries() {
  const savedEntries = JSON.parse(localStorage.getItem("wheelsEntries")) || [];

  return savedEntries.map(function (entry) {
    return {
      text: entry.text || "",
      category: entry.category || "Health",
      createdAt: entry.createdAt || new Date().toISOString(),
    };
  });
}

function getVisibleWheelsEntries() {
  return wheelsEntries.filter(function (entry) {
    const matchesFilter = wheelsCurrentFilter === "All" || entry.category === wheelsCurrentFilter;
    const matchesSearch = entry.text.toLowerCase().includes(wheelsCurrentSearch);

    return matchesFilter && matchesSearch;
  });
}

function updateWheelsCount() {
  const visibleEntries = getVisibleWheelsEntries();
  const entryLabel = visibleEntries.length === 1 ? "entry" : "entries";
  wheelsCount.textContent = `${visibleEntries.length} ${entryLabel} shown`;
}

function formatEntryTime(dateText) {
  return new Date(dateText).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateInputValue(dateText) {
  const date = new Date(dateText);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTimeInputValue(dateText) {
  const date = new Date(dateText);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function formatEntryDate(dateText) {
  return new Date(dateText).toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatEntryTimeOnly(dateText) {
  return new Date(dateText).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function parseWheelsMarkdown(markdown) {
  const importedEntries = [];
  const lines = markdown.split(/\r?\n/);
  let currentDate = "";

  lines.forEach(function (line) {
    if (line.startsWith("## ")) {
      currentDate = line.replace("## ", "").trim();
      return;
    }

    const entryMatch = line.match(/^- \*\*(.+?) - (Food|Beverage|Health):\*\* (.+)$/);

    if (!entryMatch || currentDate === "") {
      return;
    }

    const timeText = entryMatch[1];
    const category = entryMatch[2];
    const text = entryMatch[3];
    const parsedDate = new Date(`${currentDate} ${timeText}`);

    if (Number.isNaN(parsedDate.getTime())) {
      return;
    }

    importedEntries.push({
      text: text,
      category: category,
      createdAt: parsedDate.toISOString(),
    });
  });

  return importedEntries;
}

function renderWheelsEntries() {
  wheelsList.innerHTML = "";

  getVisibleWheelsEntries().forEach(function (entry) {
    const newEntry = document.createElement("li");
    const entryMain = document.createElement("div");
    const entryActions = document.createElement("div");
    const entryText = document.createElement("span");
    const entryTime = document.createElement("span");
    const categoryBadge = document.createElement("span");
    const editTimeButton = document.createElement("button");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");
    const timeEditor = document.createElement("div");
    const dateInput = document.createElement("input");
    const timeInput = document.createElement("input");
    const saveTimeButton = document.createElement("button");
    const cancelTimeButton = document.createElement("button");

    entryMain.className = "entry-main";
    entryActions.className = "entry-actions";
    timeEditor.className = "time-editor";
    timeEditor.hidden = true;

    entryText.textContent = entry.text;
    entryText.className = "note-text";

    entryTime.textContent = formatEntryTime(entry.createdAt);
    entryTime.className = "entry-time";

    categoryBadge.textContent = entry.category;
    categoryBadge.className = `category-badge wheels-category ${entry.category.toLowerCase()}-category`;

    editTimeButton.textContent = "Edit Time";
    editTimeButton.className = "time-button";

    editTimeButton.addEventListener("click", function () {
      dateInput.value = formatDateInputValue(entry.createdAt);
      timeInput.value = formatTimeInputValue(entry.createdAt);
      timeEditor.hidden = false;
    });

    dateInput.type = "date";
    dateInput.className = "time-edit-input";
    dateInput.value = formatDateInputValue(entry.createdAt);

    timeInput.type = "time";
    timeInput.className = "time-edit-input";
    timeInput.value = formatTimeInputValue(entry.createdAt);

    saveTimeButton.textContent = "Save Time";
    saveTimeButton.className = "save-time-button";

    saveTimeButton.addEventListener("click", function () {
      const updatedDate = dateInput.value;
      const updatedTime = timeInput.value;

      if (updatedDate === "" || updatedTime === "") {
        return;
      }

      entry.createdAt = new Date(`${updatedDate}T${updatedTime}`).toISOString();
      saveWheelsEntries();
      renderWheelsEntries();
    });

    cancelTimeButton.textContent = "Cancel";
    cancelTimeButton.className = "cancel-time-button";

    cancelTimeButton.addEventListener("click", function () {
      timeEditor.hidden = true;
    });

    editButton.textContent = "Edit";
    editButton.className = "edit-button";

    editButton.addEventListener("click", function () {
      const updatedText = prompt("Edit this Wheels entry:", entry.text);

      if (updatedText === null || updatedText.trim() === "") {
        return;
      }

      entry.text = updatedText.trim();
      saveWheelsEntries();
      renderWheelsEntries();
    });

    deleteButton.textContent = "Remove";
    deleteButton.className = "remove-button";

    deleteButton.addEventListener("click", function () {
      const index = wheelsEntries.indexOf(entry);
      wheelsEntries.splice(index, 1);
      saveWheelsEntries();
      renderWheelsEntries();
    });

    entryMain.appendChild(categoryBadge);
    entryMain.appendChild(entryText);
    entryMain.appendChild(entryTime);

    timeEditor.appendChild(dateInput);
    timeEditor.appendChild(timeInput);
    timeEditor.appendChild(saveTimeButton);
    timeEditor.appendChild(cancelTimeButton);

    entryActions.appendChild(editTimeButton);
    entryActions.appendChild(editButton);
    entryActions.appendChild(deleteButton);

    newEntry.appendChild(entryMain);
    newEntry.appendChild(timeEditor);
    newEntry.appendChild(entryActions);
    wheelsList.appendChild(newEntry);
  });

  updateWheelsCount();
}

wheelsFilterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    wheelsCurrentFilter = button.dataset.filter;

    wheelsFilterButtons.forEach(function (filterButton) {
      filterButton.classList.remove("active");
    });

    button.classList.add("active");
    renderWheelsEntries();
  });
});

wheelsSearch.addEventListener("input", function () {
  wheelsCurrentSearch = wheelsSearch.value.trim().toLowerCase();
  renderWheelsEntries();
});

wheelsForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const entryText = wheelsInput.value.trim();

  if (entryText === "") {
    return;
  }

  wheelsEntries.push({
    text: entryText,
    category: wheelsCategoryInput.value,
    createdAt: new Date().toISOString(),
  });

  saveWheelsEntries();
  renderWheelsEntries();
  wheelsUndoButton.hidden = true;

  wheelsInput.value = "";
  wheelsInput.focus();
});

wheelsClearButton.addEventListener("click", function () {
  wheelsEntriesBeforeClear = wheelsEntries.slice();
  wheelsEntries = [];
  saveWheelsEntries();
  renderWheelsEntries();
  wheelsUndoButton.hidden = wheelsEntriesBeforeClear.length === 0;
});

wheelsUndoButton.addEventListener("click", function () {
  wheelsEntries = wheelsEntriesBeforeClear.slice();
  wheelsEntriesBeforeClear = [];
  saveWheelsEntries();
  renderWheelsEntries();
  wheelsUndoButton.hidden = true;
});

wheelsExportButton.addEventListener("click", function () {
  const sortedEntries = wheelsEntries.slice().sort(function (firstEntry, secondEntry) {
    return new Date(firstEntry.createdAt) - new Date(secondEntry.createdAt);
  });
  const markdownLines = ["# Wheels Status", ""];
  let currentDate = "";

  sortedEntries.forEach(function (entry) {
    const entryDate = formatEntryDate(entry.createdAt);
    const entryTime = formatEntryTimeOnly(entry.createdAt);

    if (entryDate !== currentDate) {
      markdownLines.push(`## ${entryDate}`, "");
      currentDate = entryDate;
    }

    markdownLines.push(`- **${entryTime} - ${entry.category}:** ${entry.text}`);
  });

  const markdown = markdownLines.join("\n");
  downloadTextFile("wheels-status.md", markdown, "text/markdown");
});

wheelsImportInput.addEventListener("change", function () {
  const file = wheelsImportInput.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", function () {
    const importedEntries = parseWheelsMarkdown(reader.result);

    if (importedEntries.length === 0) {
      alert("No Wheels entries were found in that file.");
      wheelsImportInput.value = "";
      return;
    }

    wheelsEntries = wheelsEntries.concat(importedEntries);
    saveWheelsEntries();
    renderWheelsEntries();
    wheelsImportInput.value = "";
  });

  reader.readAsText(file);
});

loadSharedWheelsButton.addEventListener("click", async function () {
  try {
    const sharedData = await loadSharedData();
    const sharedWheelsEntries = sharedData.wheelsEntries || [];

    wheelsEntries = wheelsEntries.concat(sharedWheelsEntries);
    saveWheelsEntries();
    renderWheelsEntries();
  } catch (error) {
    alert("Shared Wheels entries could not be loaded.");
  }
});

renderWheelsEntries();
loadShanghaiWeather();
