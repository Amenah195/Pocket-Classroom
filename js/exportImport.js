// exportImport.js
import { loadIndex, loadCapsule, saveCapsule, updateIndexEntry } from "./storage.js";
import { renderLibrary } from "./library.js";

// Export all capsules to JSON file
export function exportAllCapsules() {
  try {
    const index = loadIndex();
    const capsules = index.map((i) => loadCapsule(i.id)).filter(Boolean);

    const payload = {
      version: "armina-classroom/v1",
      capsules,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "armina-classroom-export.json";
    a.click();

    URL.revokeObjectURL(url);
    alert("Export completed! Your file has been downloaded.");
  } catch (err) {
    console.error("Export error:", err);
    alert("Failed to export capsules.");
  }
}

// Import capsules from JSON file
export function importCapsules(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      if (data.version !== "armina-classroom/v1") {
        alert("Invalid file format or version.");
        return;
      }

      if (!Array.isArray(data.capsules)) {
        alert("File does not contain valid capsule data.");
        return;
      }

      data.capsules.forEach((c) => {
        saveCapsule(c.id, c);
        updateIndexEntry({
          id: c.id,
          title: c.title,
          subject: c.subject || "",
          level: c.level || "Beginner",
          description:
            (c.notes?.[0] || c.flashcards?.[0]?.front || c.quiz?.[0]?.q || "").slice(0, 150),
          updatedAt: c.updatedAt || Date.now(),
        });
      });

      alert("Import completed successfully!");
      renderLibrary();
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to import file. Please check your JSON format.");
    }
  };

  reader.readAsText(file);
}
