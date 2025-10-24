// storage.js
// LocalStorage helper functions for Armina Classroom

// Create unique ID
export function makeId() {
  return "id-" + Math.random().toString(36).substring(2, 9);
}

// Save a capsule
export function saveCapsule(id, capsule) {
  try {
    localStorage.setItem(`pc_capsule_${id}`, JSON.stringify(capsule));
  } catch (err) {
    console.error("Error saving capsule:", err);
  }
}

// Load a capsule
export function loadCapsule(id) {
  try {
    const data = localStorage.getItem(`pc_capsule_${id}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Error parsing capsule:", err);
    return null;
  }
}

// Save index (list of capsule metadata)
export function saveIndex(list) {
  try {
    localStorage.setItem("pc_capsules_index", JSON.stringify(list));
  } catch (err) {
    console.error("Error saving index:", err);
  }
}

// Load index
export function loadIndex() {
  try {
    const data = localStorage.getItem("pc_capsules_index");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error loading index:", err);
    return [];
  }
}

// Update (or insert) index entry
export function updateIndexEntry(entry) {
  const list = loadIndex();
  const i = list.findIndex((it) => it.id === entry.id);

  if (i >= 0) {
    list[i] = { ...list[i], ...entry };
  } else {
    list.unshift(entry); // Add new entry at beginning
  }

  saveIndex(list);
}

// Remove index entry
export function removeIndexEntry(id) {
  const list = loadIndex().filter((item) => item.id !== id);
  saveIndex(list);
  try {
    localStorage.removeItem(`pc_capsule_${id}`);
  } catch (err) {
    console.error("Error removing capsule:", err);
  }
}

// Save learning progress
export function saveProgress(id, progress) {
  try {
    localStorage.setItem(`pc_progress_${id}`, JSON.stringify(progress));
  } catch (err) {
    console.error("saveProgress error:", err);
  }
}

// Load learning progress
export function loadProgress(id) {
  try {
    const raw = localStorage.getItem(`pc_progress_${id}`);
    return raw
      ? JSON.parse(raw)
      : { bestScore: 0, knownFlashcards: [] };
  } catch (err) {
    console.error("loadProgress error:", err);
    return { bestScore: 0, knownFlashcards: [] };
  }
}
