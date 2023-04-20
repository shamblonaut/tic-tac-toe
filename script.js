const Player = (name, piece) => {
  return { name, piece };
};

const game = (() => {
  let mode = "";
  let board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
  let players = [];
  let scores = [0, 0];

  let currentPlayer;
  let firstPlayer;
  let gameOver = false;
  let result = {
    win: "",
    strike: [],
  };

  const getBoard = () => board;
  const getMode = () => mode;
  const getGameOver = () => gameOver;
  const getResult = () => result;
  const getPlayers = () => players;
  const getCurrentPlayer = () => currentPlayer;
  const getFirstPlayer = () => firstPlayer;
  const getScores = () => scores;

  const setMode = (gameMode) => {
    mode = gameMode;
  };

  const setPlayers = (playerNames, pieces) => {
    players = [Player(playerNames[0], "X"), Player(playerNames[1], "O")];
    currentPlayer = players[0];
    firstPlayer = players[0];
  };

  const resetBoard = () => {
    board.fill(" ");
    gameOver = false;
    result.win = "";
    result.strike = [];
    currentPlayer = firstPlayer;
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
      firstPlayer = firstPlayer === players[0] ? players[1] : players[0];
    } else if (filled) {
      gameOver = true;
      result.win = "The game ended in a draw";
      firstPlayer = firstPlayer === players[0] ? players[1] : players[0];
    }
  };

  const placePiece = (position) => {
    if (board[position] === " " && !gameOver) {
      board[position] = currentPlayer.piece;
      checkBoard();
      currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
      return true;
    } else if (gameOver) return true;
    return false;
  };

  const placePlayerPiece = (position) => {
    if (currentPlayer.name !== "Computer") {
      return placePiece(position);
    }
    return false;
  };

  const placeComputerPiece = () => {
    if (currentPlayer.name === "Computer") {
      let position = Math.floor(Math.random() * 10);
      while (!placePiece(position)) {
        position = Math.floor(Math.random() * 10);
      }
      return true;
    }
    return false;
  };

  return {
    resetBoard,
    getBoard,
    getMode,
    getGameOver,
    getResult,
    getPlayers,
    getFirstPlayer,
    getScores,
    setMode,
    setPlayers,
    placePlayerPiece,
    placeComputerPiece,
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

  const computerPlayButton = document.querySelector(".play.computer");
  const friendPlayButton = document.querySelector(".play.friend");
  const startButtons = document.querySelectorAll(".start");
  const restartButton = document.querySelector(".restart");

  const singlePlayerForm = document.querySelector(".players.computer");
  const twoPlayerForm = document.querySelector(".players.friend");

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
        const players = game.getPlayers();
        const scores = game.getScores();
        scoreContainers[0].textContent = `${players[0].name}: ${scores[0]}`;
        scoreContainers[1].textContent = `${players[1].name}: ${scores[1]}`;
      }, 1 * 1000);
    }
  };

  // Start a round
  const startGame = () => {
    displaySection(gameSection);
    game.resetBoard();

    if (
      game.getMode() === "computer" &&
      game.getFirstPlayer().name === "Computer"
    ) {
      setTimeout(() => {
        if (game.placeComputerPiece()) {
          updateBoard();
        }
      }, 500);
    }
    updateBoard();
  };

  /*
   ** Event Listeners
   */
  Array.from(gameBoardContainer.children).forEach((square) => {
    square.addEventListener("click", () => {
      if (game.placePlayerPiece(square.dataset["position"])) {
        updateBoard();
      }
      if (game.getMode() === "computer" && !game.getGameOver()) {
        setTimeout(() => {
          if (game.placeComputerPiece()) {
            updateBoard();
          }
        }, 500);
      }
    });
  });

  computerPlayButton.addEventListener("click", () => {
    popupContainer.style.display = "flex";
    singlePlayerForm.style.display = "flex";
  });

  friendPlayButton.addEventListener("click", () => {
    popupContainer.style.display = "flex";
    twoPlayerForm.style.display = "flex";
  });

  startButtons.forEach((startButton) => {
    startButton.addEventListener("click", (event) => {
      event.preventDefault();
      let playerData;
      let playerNames;
      if (startButton.parentElement.classList.contains("computer")) {
        game.setMode("computer");
        playerData = new FormData(singlePlayerForm);

        const playerPiece = playerData.get("piece");
        let playerPieces = [];
        const playerName = playerData.get("player") ? playerData.get("player") : "You";
        if (playerPiece === "X") {
          playerNames = [
            playerName,
            "Computer",
          ];
        } else {
          playerNames = [
            "Computer",
            playerName,
          ];
        }

        game.setPlayers(playerNames);
        singlePlayerForm.style.display = "none";
      } else {
        game.setMode("friend");
        playerData = new FormData(twoPlayerForm);
        playerNames = [
          playerData.get("player-one")
            ? playerData.get("player-one")
            : "Player 1",
          playerData.get("player-two")
            ? playerData.get("player-two")
            : "Player 2",
        ];
        game.setPlayers(playerNames);
        twoPlayerForm.style.display = "none";
      }
      popupContainer.style.display = "none";

      startGame();
    });
  });

  restartButton.addEventListener("click", startGame);
})();
