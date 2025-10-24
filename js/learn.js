// learn.js
import { loadCapsule, saveProgress, loadProgress } from "./storage.js";

const learnContent = document.getElementById("learn-content");
const learnTitle = document.getElementById("learn-title");
const learnMeta = document.getElementById("learn-meta");

// Start learn mode for a selected capsule
export function startLearnMode(capsuleId) {
  const capsule = loadCapsule(capsuleId);

  if (!capsule) {
    learnContent.innerHTML = `<div class="text-danger">No capsule found!</div>`;
    return;
  }

  // Set header
  learnTitle.textContent = capsule.title || "Learning Space";
  learnMeta.textContent = `${capsule.subject || ""} • ${capsule.level || ""}`;

  // Clear content area
  learnContent.innerHTML = "";

  // --- NOTES ---
  if ((capsule.notes || []).length > 0) {
    const container = document.createElement("div");
    container.innerHTML = `
      <h5>Notes</h5>
      <ol class="mb-3" id="notes-list"></ol>
    `;
    const ol = container.querySelector("#notes-list");
    capsule.notes.forEach((n) => {
      const li = document.createElement("li");
      li.textContent = n;
      ol.appendChild(li);
    });
    learnContent.appendChild(container);
  }

  // --- FLASHCARDS ---
  if ((capsule.flashcards || []).length > 0) {
    const cards = capsule.flashcards;
    let idx = 0;

    const wrapper = document.createElement("div");
    wrapper.className = "mb-4";

    const cardEl = document.createElement("div");
    cardEl.className = "flashcard mb-2";

    const inner = document.createElement("div");
    inner.className = "flashcard-inner";
    inner.innerHTML = `
      <div class="flashcard-face">${escapeHtml(cards[0].front)}</div>
      <div class="flashcard-face flashcard-back">${escapeHtml(cards[0].back)}</div>
    `;
    cardEl.appendChild(inner);
    wrapper.appendChild(cardEl);

    // Controls
    const controls = document.createElement("div");
    controls.className = "d-flex gap-2";
    const prevBtn = document.createElement("button");
    prevBtn.className = "btn btn-sm btn-outline-secondary";
    prevBtn.textContent = "Prev";

    const flipBtn = document.createElement("button");
    flipBtn.className = "btn btn-sm btn-outline-primary";
    flipBtn.textContent = "Flip";

    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-sm btn-outline-secondary";
    nextBtn.textContent = "Next";

    controls.append(prevBtn, flipBtn, nextBtn);
    wrapper.appendChild(controls);
    learnContent.appendChild(wrapper);

    // Event handlers
    prevBtn.addEventListener("click", () => {
      idx = (idx - 1 + cards.length) % cards.length;
      updateCard();
    });
    nextBtn.addEventListener("click", () => {
      idx = (idx + 1) % cards.length;
      updateCard();
    });
    flipBtn.addEventListener("click", () => {
      cardEl.classList.toggle("flipped");
    });

    function updateCard() {
      inner.innerHTML = `
        <div class="flashcard-face">${escapeHtml(cards[idx].front)}</div>
        <div class="flashcard-face flashcard-back">${escapeHtml(cards[idx].back)}</div>
      `;
      cardEl.classList.remove("flipped");
    }

    // Load progress (future use)
    loadProgress(capsuleId);
  }

  // --- QUIZ ---
  if ((capsule.quiz || []).length > 0) {
    const questions = capsule.quiz;
    let current = 0;
    let score = 0;

    const box = document.createElement("div");
    box.className = "mb-4";
    const qHolder = document.createElement("div");
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-success mt-2";
    nextBtn.textContent = "Next";

    function render() {
      const q = questions[current];
      qHolder.innerHTML = `
        <h5>${escapeHtml(q.q || q.question || "Question")}</h5>
        <div id="opts">
          ${(q.options || [])
            .map(
              (opt, i) => `
            <div class="form-check">
              <input class="form-check-input" type="radio" name="learn-opt" id="opt${i}" value="${i}">
              <label class="form-check-label" for="opt${i}">${escapeHtml(opt)}</label>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    nextBtn.addEventListener("click", () => {
      const sel = document.querySelector('input[name="learn-opt"]:checked');
      if (!sel) {
        alert("Select an answer first!");
        return;
      }

      const correct =
        parseInt(sel.value) ===
        (questions[current].answer || questions[current].correctIndex || 0);
      if (correct) score++;

      current++;
      if (current < questions.length) {
        render();
      } else {
        qHolder.innerHTML = `<h4>Done — Score: ${score} / ${questions.length}</h4>`;
        saveProgress(capsule.id || capsuleId, {
          bestScore: score,
          knownFlashcards: [],
        });
        nextBtn.disabled = true;
      }
    });

    render();
    box.appendChild(qHolder);
    box.appendChild(nextBtn);
    learnContent.appendChild(box);
  }

  // If nothing to learn
  if (
    !capsule.notes?.length &&
    !capsule.flashcards?.length &&
    !capsule.quiz?.length
  ) {
    learnContent.innerHTML = `
      <div class="text-muted">This capsule contains no learnable content.</div>
    `;
  }
}

// Escape HTML helper
function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}
