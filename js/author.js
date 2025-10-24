// author.js
import {
  loadCapsule,
  saveCapsule,
  makeId,
  updateIndexEntry,
} from "./storage.js";

// Form elements
const form = document.getElementById("author-form");
const titleEl = document.getElementById("capsule-title");
const subjectEl = document.getElementById("capsule-subject");
const levelEl = document.getElementById("capsule-level");
const notesEl = document.getElementById("capsule-notes");
const flashEl = document.getElementById("capsule-flashcards");
const quizEl = document.getElementById("capsule-quiz");
const editingIdEl = document.getElementById("editing-id");
const saveBtn = document.getElementById("save-capsule-btn");
const cancelBtn = document.getElementById("cancel-author-btn");

// Initialize author handlers
export function initAuthorHandlers() {
  if (!saveBtn || !cancelBtn) return;

  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    onSave();
  });

  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    clearForm();
    // Go back to library
    document
      .querySelectorAll("nav .nav-link")
      .forEach((n) => n.classList.remove("active"));
    document
      .querySelector('nav .nav-link[data-view="library"]')
      .classList.add("active");
    showView("library");
  });
}

// Show Author view and optionally load capsule for editing
export function openAuthor(editId = null) {
  document
    .querySelectorAll("nav .nav-link")
    .forEach((n) => n.classList.remove("active"));
  document
    .querySelector('nav .nav-link[data-view="author"]')
    .classList.add("active");
  showView("author");

  if (editId) {
    loadForEdit(editId);
  } else {
    clearForm();
  }
}

// Load capsule data into form
export function loadForEdit(id) {
  const capsule = loadCapsule(id);
  if (!capsule) return;

  editingIdEl.value = id;
  titleEl.value = capsule.title || "";
  subjectEl.value = capsule.subject || "";
  levelEl.value = capsule.level || "Beginner";
  notesEl.value = (capsule.notes || []).join("\n");
  flashEl.value = (capsule.flashcards || [])
    .map((p) => `${p.front} || ${p.back}`)
    .join("\n");

  try {
    quizEl.value = capsule.quiz ? JSON.stringify(capsule.quiz, null, 2) : "";
  } catch {
    quizEl.value = "";
  }
}

// Helpers to parse input text into structured arrays
function parseNotes(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function parseFlashcards(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines
    .map((l) => {
      const parts = l.split("||").map((p) => p.trim());
      return { front: parts[0] || "", back: parts[1] || "" };
    })
    .filter((p) => p.front || p.back);
}

function parseQuiz(text) {
  if (!text.trim()) return [];
  try {
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => ({
      q: item.q || item.question || "",
      options: item.options || item.opts || [],
      answer:
        typeof item.answer === "number"
          ? item.answer
          : parseInt(item.correctIndex) || 0,
      explanation: item.explanation || "",
    }));
  } catch (err) {
    alert("Quiz JSON is invalid. Please follow the example format.");
    return null;
  }
}

// Save capsule
function onSave() {
  const title = titleEl.value.trim();
  if (!title) {
    alert("Title is required.");
    return;
  }

  const notes = parseNotes(notesEl.value);
  const flashcards = parseFlashcards(flashEl.value);
  const quiz = parseQuiz(quizEl.value);
  if (quiz === null) return; // JSON parse error

  if (notes.length === 0 && flashcards.length === 0 && quiz.length === 0) {
    if (!confirm("No content provided. Save an empty capsule?")) return;
  }

  const id = editingIdEl.value || makeId();

  const capsule = {
    id,
    title,
    subject: subjectEl.value.trim(),
    level: levelEl.value,
    notes,
    flashcards,
    quiz,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  saveCapsule(id, capsule);

  // Update index entry
  updateIndexEntry({
    id,
    title,
    subject: capsule.subject,
    level: capsule.level,
    description:
      (notes[0] ||
        flashcards[0]?.front ||
        capsule.quiz?.[0]?.q ||
        "")?.slice(0, 150),
    updatedAt: capsule.updatedAt,
  });

  alert("Capsule saved successfully!");
  clearForm();
  document.dispatchEvent(new CustomEvent("capsule-saved"));
}

// Clear the author form
function clearForm() {
  editingIdEl.value = "";
  titleEl.value = "";
  subjectEl.value = "";
  levelEl.value = "Beginner";
  notesEl.value = "";
  flashEl.value = "";
  quizEl.value = "";
}

// Utility: show a specific view
function showView(name) {
  document.querySelectorAll("main > section").forEach((s) => {
    s.classList.add("d-none");
  });
  const el = document.getElementById(`${name}-view`);
  if (el) el.classList.remove("d-none");
}
