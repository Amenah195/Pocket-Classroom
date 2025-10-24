// library.js
import { loadIndex, loadCapsule, removeIndexEntry } from "./storage.js";

const grid = document.getElementById("library-grid");

// Render the library grid
export function renderLibrary() {
  if (!grid) return;

  const list = loadIndex();
  grid.innerHTML = "";

  if (!list || list.length === 0) {
    grid.innerHTML = `
      <div class="text-center text-muted mt-4">
        <p class="mb-1  text-muted ">No learning capsules yet.</p>
        <p class="small text-muted">Create one using <strong>New Capsule</strong>.</p>
      </div>
    `;
    return;
  }

  const row = document.createElement("div");
  row.className = "row g-3";

  list.forEach((meta) => {
    const col = document.createElement("div");
    col.className = "col-md-4";

    // load capsule for progress display
    const capsule = loadCapsule(meta.id) || {};
    const bestScore =
      (capsule.progress && capsule.progress.bestScore) ?? 0;
    const known =
      (capsule.progress && capsule.progress.knownFlashcards)
        ? capsule.progress.knownFlashcards.length
        : 0;
    const updated = meta.updatedAt
      ? new Date(meta.updatedAt).toLocaleString()
      : "";

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title mb-1">${escapeHtml(meta.title)}</h5>
          <div class="mb-2 small text-muted">
            ${escapeHtml(meta.subject || "")} • ${escapeHtml(meta.level || "")}
          </div>
          <p class="card-text small text-muted mb-0">
            ${escapeHtml(meta.description || "")}
          </p>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
          <div class="small text-muted">Updated: ${updated}</div>
          <div class="button-container">
            <button class="btn  text-light  btn-sm btn-success me-1" data-action="learn" data-id="${meta.id}">Learn</button>
            <button class="btn btn-sm btn-success me-1" data-action="edit" data-id="${meta.id}">Edit</button>
            <button class="btn btn-sm btn-danger" data-action="delete" data-id="${meta.id}">Delete</button>
          </div>
        </div>
      </div>
    `;
    row.appendChild(col);
  });

  grid.appendChild(row);
}

// Handle buttons (Learn, Edit, Delete)
if (grid) {
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "delete") {
      if (!confirm("Delete this capsule?")) return;
      removeIndexEntry(id);
      localStorage.removeItem(`pc_capsule_${id}`);
      renderLibrary();
      return;
    }

    // Dispatch custom event for main.js to handle edit/learn
    document.dispatchEvent(
      new CustomEvent("library-action", { detail: { action, id } })
    );
  });
}

// Escape HTML helper
function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}
