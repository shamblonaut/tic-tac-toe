const Player = (name, piece) => {
  return { name, piece };
};

const game = (() => {
  let board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
  let players = [];
  let scores = [0, 0];

  let currentPlayer;
  let gameOver = false;
  let result = {
    win: "",
    strike: [],
  };

  const getBoard = () => board;
  const getGameOver = () => gameOver;
  const getResult = () => result;
  const getPlayers = () => players;
  const getScores = () => scores;

  const setPlayers = (playerNames) => {
    players = [Player(playerNames[0], "X"), Player(playerNames[1], "O")];
    currentPlayer = players[0];
  };

  const resetBoard = () => {
    board.fill(" ");
    gameOver = false;
    result.win = "";
    result.strike = [];
  };

  const checkBoard = () => {
    let filled = true;
    let win = false;
    let strike = [];
    const piece = currentPlayer.piece;

    if (board[0] === piece && board[4] === piece && board[8] === piece) {
      win = true;
      strike = [0, 4, 8];
    } else if (board[2] === piece && board[4] === piece && board[6] === piece) {
      win = true;
      strike = [2, 4, 6];
    }
    for (let i = 0; i < 9; i++) {
      if (
        i < 3 &&
        board[i] === piece &&
        board[i + 3] === piece &&
        board[i + 6] === piece
      ) {
        win = true;
        strike = [i, i + 3, i + 6];
        break;
      } else if (
        i % 3 === 0 &&
        board[i] === piece &&
        board[i + 1] === piece &&
        board[i + 2] === piece
      ) {
        win = true;
        strike = [i, i + 1, i + 2];
        break;
      } else if (board[i] === " ") {
        filled = false;
      }
    }

    if (win) {
      gameOver = true;
      result.win = `${currentPlayer.name} won the game!`;

      // Increment player score
      if (currentPlayer === players[0]) scores[0]++;
      else scores[1]++;

      result.strike = strike;
    } else if (filled) {
      gameOver = true;
      result.win = "The game ended in a draw";
    }
  };

  const placePiece = (position) => {
    if (board[position] === " " && !gameOver) {
      board[position] = currentPlayer.piece;
      checkBoard();
      currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }
  };

  return {
    placePiece,
    resetBoard,
    getBoard,
    getGameOver,
    getResult,
    getPlayers,
    getScores,
    setPlayers,
  };
})();

const displayController = (() => {
  const introSection = document.querySelector(".intro");
  const gameSection = document.querySelector(".game");
  const gameOverSection = document.querySelector(".game-over");
  const sections = [introSection, gameSection, gameOverSection];

  const gameBoardContainer = document.querySelector(".board");
  const resultContainer = document.querySelector(".result");
  const scoreContainers = document.querySelectorAll(".score");
  const popupContainer = document.querySelector(".popup-container");

  const playButton = document.querySelector(".play");
  const startButton = document.querySelector(".start");
  const restartButton = document.querySelector(".restart");

  const playerNamesForm = document.querySelector(".players");

  // Creating the game board
  for (let i = 0; i < 9; i++) {
    const square = document.createElement("button");
    square.classList.add("square");
    square.dataset["position"] = i;

    if (i === 2 || i === 5) square.style["border-width"] = "0 0 5px 0";
    else if (i === 6 || i === 7) square.style["border-width"] = "0 5px 0 0";
    else if (i === 8) square.style["border-width"] = "0";
    else square.style["border-width"] = "0 5px 5px 0";

    gameBoardContainer.appendChild(square);
  }

  /*
   ** Module functions
   */
  const displaySection = (sectionToDisplay) => {
    sectionToDisplay.style.display = "flex";
    sections.forEach((section) => {
      if (section !== sectionToDisplay) section.style.display = "none";
    });
  };

  const updateBoard = () => {
    const gameBoard = game.getBoard();
    Array.from(gameBoardContainer.children).forEach((square) => {
      position = Number(square.dataset["position"]);
      square.textContent = gameBoard[position];

      // Highlight the victory strike
      if (game.getGameOver() && !game.getResult().strike.includes(position)) {
        square.style["color"] = "#64748b";
      } else {
        square.style["color"] = "#f1f5f9";
      }
    });

    // Show result
    if (game.getGameOver()) {
      setTimeout(() => {
        displaySection(gameOverSection);
        resultContainer.textContent = game.getResult().win;
        scoreContainers[0].textContent = `${game.getPlayers()[0].name}: ${
          game.getScores()[0]
        }`;
        scoreContainers[1].textContent = `${game.getPlayers()[1].name}: ${
          game.getScores()[1]
        }`;
      }, 1 * 1000);
    }
  };

  // Start a round
  const startGame = () => {
    displaySection(gameSection);
    game.resetBoard();
    updateBoard();
  };

  /*
   ** Event Listeners
   */
  Array.from(gameBoardContainer.children).forEach((square) => {
    square.addEventListener("click", () => {
      game.placePiece(square.dataset["position"]);
      updateBoard();
    });
  });

  playButton.addEventListener("click", () => {
    popupContainer.style.display = "flex";
  });

  startButton.addEventListener("click", (event) => {
    event.preventDefault();
    const playersData = new FormData(playerNamesForm);
    const playerNames = [
      playersData.get("player-one") ? playersData.get("player-one") : "Player 1",
      playersData.get("player-two") ? playersData.get("player-two") : "Player 2",
    ];
    game.setPlayers(playerNames);
    popupContainer.style.display = "none";
    startGame();
  });

  restartButton.addEventListener("click", startGame);
})();
