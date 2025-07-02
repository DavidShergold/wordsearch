console.log("Script loaded!");

const gridSize = 20;

let letterGrid = Array.from({
    length: gridSize
}, () => Array(gridSize).fill(""));

const wordList = [
    "PYTHON", "ARRAY", "CODE", "DEBUG", "LOOP",
    "SCRIPT", "VARIABLE", "FUNCTION", "OBJECT",
    "CLASS", "STRING", "BOOLEAN", "LOGIC", "IMPORT", "RETURN"
];

const wordsLeft = document.getElementById("words-left");
const wordsRight = document.getElementById("words-right");

// Split the word list in half
const midpoint = Math.ceil(wordList.length / 2);
const leftWords = wordList.slice(0, midpoint);
const rightWords = wordList.slice(midpoint);

leftWords.forEach(word => {
    const li = document.createElement("li");
    li.textContent = word;
    wordsLeft.appendChild(li);
});

rightWords.forEach(word => {
    const li = document.createElement("li");
    li.textContent = word;
    wordsRight.appendChild(li);
});

function canPlaceWord(word, row, col, dx, dy) {
    for (let i = 0; i < word.length; i++) {
        const r = row + i * dy;
        const c = col + i * dx;

        if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;

        const current = letterGrid[r][c];
        if (current !== "" && current !== word[i]) return false;
    }
    return true;
}

function placeWordAt(word, row, col, dx, dy) {
    for (let i = 0; i < word.length; i++) {
        const r = row + i * dy;
        const c = col + i * dx;
        letterGrid[r][c] = word[i];
    }
}

function tryPlaceWord(word) {
    const directions = [{
            dx: 1,
            dy: 0
        }, // Horizontal →
        {
            dx: 0,
            dy: 1
        }, // Vertical ↓
        {
            dx: 1,
            dy: 1
        } // Diagonal ↘
    ];

    const maxAttempts = 100;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const {
            dx,
            dy
        } = directions[Math.floor(Math.random() * directions.length)];
        const maxRow = gridSize - (dy ? word.length : 0);
        const maxCol = gridSize - (dx ? word.length : 0);
        const row = Math.floor(Math.random() * (maxRow + 1));
        const col = Math.floor(Math.random() * (maxCol + 1));

        if (canPlaceWord(word, row, col, dx, dy)) {
            placeWordAt(word, row, col, dx, dy);
            return true;
        }
    }

    console.warn(`Could not place: ${word}`);
    return false;
}


// Place all words in the list
wordList.forEach(tryPlaceWord);



// Create a blank grid
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let selectedCells = [];

function clearSelection() {
    selectedCells.forEach(cell => cell.classList.remove("selected"));
    selectedCells = [];
}

function checkWord() {
  if (selectedCells.length !== 2) return;

  const [start, end] = selectedCells;
  const row1 = parseInt(start.dataset.row);
  const col1 = parseInt(start.dataset.col);
  const row2 = parseInt(end.dataset.row);
  const col2 = parseInt(end.dataset.col);

  const dx = col2 - col1;
  const dy = row2 - row1;
  const len = Math.max(Math.abs(dx), Math.abs(dy));

  // Normalize direction
  const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
  const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

  const path = [];

  for (let i = 0; i <= len; i++) {
    const r = row1 + stepY * i;
    const c = col1 + stepX * i;
    const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
    if (!cell) return clearSelection(); // Invalid path
    path.push(cell);
  }

  const word = path.map(cell => cell.textContent).join("");
  const reversed = [...word].reverse().join("");

  if (wordList.includes(word) || wordList.includes(reversed)) {
    path.forEach(cell => cell.classList.add("found"));
    const foundWord = wordList.includes(word) ? word : reversed;
    document.querySelectorAll("li").forEach(li => {
      if (li.textContent === foundWord) li.classList.add("found");
    });
  }

  clearSelection();
}


for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
        if (letterGrid[row][col] === "") {
            letterGrid[row][col] = letters[Math.floor(Math.random() * letters.length)];
        }

        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.textContent = letterGrid[row][col];
        cell.dataset.row = row;
        cell.dataset.col = col;

        cell.addEventListener("click", () => {
            if (cell.classList.contains("found")) return;

            cell.classList.toggle("selected");
            if (selectedCells.includes(cell)) {
                selectedCells = selectedCells.filter(c => c !== cell);
            } else {
                selectedCells.push(cell);
            }

            if (selectedCells.length >= 2) {
                checkWord();
            }
        });

        grid.appendChild(cell);
    }
}

let scale = 1;
const minZoom = 0.5;
const maxZoom = 2;
const zoomStep = 0.1;

grid.addEventListener("wheel", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return; // Let browser handle pinch/gesture zoom

  e.preventDefault();

  const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
  scale = Math.min(maxZoom, Math.max(minZoom, scale + delta));

  grid.style.transform = `scale(${scale})`;
  grid.style.transformOrigin = "top center";
});