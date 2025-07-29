// app.js
let boxes = document.querySelectorAll(".box");
let resetbtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let modeSelect = document.querySelector("#mode");
let difficultySelect = document.querySelector("#difficulty");
let scoreDisplay = document.querySelector("#score");

let clickSound = document.querySelector("#clickSound");
let winSound = document.querySelector("#winSound");
let drawSound = document.querySelector("#drawSound");

let turnO = true; // true = O, false = X
let isGameOver = false;
let playerScore = 0, computerScore = 0, drawScore = 0;

const winPatterns = [
  [0 , 1, 2], [0 , 3, 6], [0 , 4, 8], [1 , 4, 7],
  [2 , 5, 8], [2 , 4, 6], [3 , 4, 5], [6 , 7, 8],
];

const resetGame = () => {
  turnO = true;
  isGameOver = false;
  enableBoxes();
  msgContainer.classList.add("hide");
};

const disableBoxes = () => {
  boxes.forEach((box) => box.disabled = true);
};

const enableBoxes = () => {
  boxes.forEach((box) => {
    box.disabled = false;
    box.innerText = "";
  });
};

const showWinner = (winner) => {
  winSound.play();
  msg.innerText = `🎉 Winner is ${winner}`;
  msgContainer.classList.remove("hide");
  disableBoxes();
  isGameOver = true;

  if (winner === "X") {
    modeSelect.value === "cpu" ? computerScore++ : playerScore++;
  } else if (winner === "O") {
    playerScore++;
  }
  updateScore();
};

const updateScore = () => {
  scoreDisplay.innerText = `Player: ${playerScore} | Computer: ${computerScore} | Draws: ${drawScore}`;
};

const checkWinner = () => {
  for (let pattern of winPatterns) {
    let [a, b, c] = pattern;
    let val1 = boxes[a].innerText;
    let val2 = boxes[b].innerText;
    let val3 = boxes[c].innerText;

    if (val1 && val1 === val2 && val2 === val3) {
      showWinner(val1);
      return;
    }
  }

  // Check draw
  if ([...boxes].every(box => box.innerText !== "") && !isGameOver) {
    drawSound.play();
    msg.innerText = "It's a Draw!";
    msgContainer.classList.remove("hide");
    isGameOver = true;
    drawScore++;
    updateScore();
  }
};

const computerMove = () => {
  if (isGameOver) return;
  const emptyBoxes = [...boxes].filter(box => box.innerText === "");
  const difficulty = difficultySelect.value;

  let move;
  if (difficulty === "easy") {
    move = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
  } else if (difficulty === "medium") {
    move = smartMove();
  } else {
    move = bestMove();
  }

  if (move) {
    setTimeout(() => {
      move.innerText = "X";
      move.disabled = true;
      clickSound.play();
      checkWinner();
      turnO = true;
    }, difficulty === "hard" ? 500 : 200);
  }
};

// Medium AI: Block or Win logic
const smartMove = () => {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    const vals = [boxes[a], boxes[b], boxes[c]].map(box => box.innerText);

    if (vals.filter(v => v === "X").length === 2 && vals.includes("")) {
      return [boxes[a], boxes[b], boxes[c]][vals.indexOf("")];
    }
    if (vals.filter(v => v === "O").length === 2 && vals.includes("")) {
      return [boxes[a], boxes[b], boxes[c]][vals.indexOf("")];
    }
  }
  return [...boxes].find(box => box.innerText === "");
};

// Hard AI: Minimax algorithm
const bestMove = () => {
  let bestScore = -Infinity;
  let move;
  boxes.forEach((box) => {
    if (box.innerText === "") {
      box.innerText = "X";
      let score = minimax(0, false);
      box.innerText = "";
      if (score > bestScore) {
        bestScore = score;
        move = box;
      }
    }
  });
  return move;
};

const minimax = (depth, isMaximizing) => {
  const result = evaluateWinner();
  if (result !== null) return scores[result];

  if (isMaximizing) {
    let best = -Infinity;
    boxes.forEach((box) => {
      if (box.innerText === "") {
        box.innerText = "X";
        let score = minimax(depth + 1, false);
        box.innerText = "";
        best = Math.max(best, score);
      }
    });
    return best;
  } else {
    let best = Infinity;
    boxes.forEach((box) => {
      if (box.innerText === "") {
        box.innerText = "O";
        let score = minimax(depth + 1, true);
        box.innerText = "";
        best = Math.min(best, score);
      }
    });
    return best;
  }
};

const evaluateWinner = () => {
  for (let pattern of winPatterns) {
    let [a, b, c] = pattern;
    let val1 = boxes[a].innerText;
    let val2 = boxes[b].innerText;
    let val3 = boxes[c].innerText;
    if (val1 && val1 === val2 && val2 === val3) return val1;
  }
  if ([...boxes].every(box => box.innerText !== "")) return "draw";
  return null;
};

const scores = {
  X: 1,
  O: -1,
  draw: 0
};

boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (box.innerText !== "" || isGameOver) return;
    box.innerText = turnO ? "O" : "X";
    box.disabled = true;
    clickSound.play();
    checkWinner();
    if (modeSelect.value === "cpu") {
      turnO = false;
      if (!isGameOver) computerMove();
    } else {
      turnO = !turnO;
    }
  });
});

newGameBtn.addEventListener("click", resetGame);
resetbtn.addEventListener("click", resetGame);
modeSelect.addEventListener("change", resetGame);
difficultySelect.addEventListener("change", resetGame);

resetGame();
