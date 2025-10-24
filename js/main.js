// main.js
import { loadIndex } from "./storage.js";
import { renderLibrary } from "./library.js";
import { initAuthorHandlers, openAuthor } from "./author.js";
import { startLearnMode } from "./learn.js";
import { importCapsules, exportAllCapsules } from "./exportImport.js";

document.addEventListener("DOMContentLoaded", () => {
  // Navigation links
  const navLinks = document.querySelectorAll("nav .nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      const view = link.dataset.view;
      showView(view);
    });
  });

  // Show default view
  showView("library");

  // Initialize author handlers
  initAuthorHandlers();

  // Render library
  renderLibrary();

  // New capsule button
  document
    .getElementById("new-capsule-btn")
    .addEventListener("click", () => openAuthor(null));

  // Hook import & export
  document
    .getElementById("export-btn")
    .addEventListener("click", exportAllCapsules);

  document
    .getElementById("import-btn")
    .addEventListener("click", () =>
      document.getElementById("import-file").click()
    );

  document
    .getElementById("import-file")
    .addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) importCapsules(file);
    });

  // Back to library button
  document
    .getElementById("back-to-library")
    .addEventListener("click", () => {
      document
        .querySelectorAll("nav .nav-link")
        .forEach((n) => n.classList.remove("active"));
      document
        .querySelector('nav .nav-link[data-view="library"]')
        .classList.add("active");
      showView("library");
    });
});

// Respond to library actions (Edit, Learn)
document.addEventListener("library-action", (e) => {
  const { action, id } = e.detail;
  if (action === "edit") {
    openAuthor(id);
  } else if (action === "learn") {
    // Switch to learn view
    document
      .querySelectorAll("nav .nav-link")
      .forEach((n) => n.classList.remove("active"));
    document
      .querySelector('nav .nav-link[data-view="learn"]')
      .classList.add("active");
    showView("learn");
    startLearnMode(id);
  }
});

// After save, refresh library
document.addEventListener("capsule-saved", () => {
  renderLibrary();
  document
    .querySelectorAll("nav .nav-link")
    .forEach((n) => n.classList.remove("active"));
  document
    .querySelector('nav .nav-link[data-view="library"]')
    .classList.add("active");
  showView("library");
});

// Utility: show the requested section
function showView(name) {
  document.querySelectorAll("main > section").forEach((s) => {
    s.classList.add("d-none");
  });
  const el = document.getElementById(`${name}-view`);
  if (el) el.classList.remove("d-none");
}
const themeToggleBtn = document.getElementById("theme-toggle");

//  Load saved theme preference from localStorage
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  if (themeToggleBtn) themeToggleBtn.textContent = "☀️ Light Mode";
}

// Apply system preference if no saved setting exists (optional)
if (!localStorage.getItem("theme")) {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
    if (themeToggleBtn) themeToggleBtn.textContent = "☀️ Light Mode";
  }
}

//  Handle button click to toggle theme
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");

    // Save user preference
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // Update button icon/text
    themeToggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  });
}
