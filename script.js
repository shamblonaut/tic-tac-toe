const Player = (name, piece) => {
  return { name, piece };
};

const game = (() => {
  let mode = "";
  let difficulty = "";
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
  const getDifficulty = () => difficulty;
  const getGameOver = () => gameOver;
  const getResult = () => result;
  const getPlayers = () => players;
  const getCurrentPlayer = () => currentPlayer;
  const getFirstPlayer = () => firstPlayer;
  const getScores = () => scores;

  const setMode = (gameMode) => {
    mode = gameMode;
  };

  const setDifficulty = (gameDifficulty) => {
    difficulty = gameDifficulty;
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

  const checkBoard = (gameBoard, player) => {
    let filled = true;
    let win = false;
    let strike = [];
    const piece = player.piece;

    if (
      gameBoard[0] === piece &&
      gameBoard[4] === piece &&
      gameBoard[8] === piece
    ) {
      win = true;
      strike = [0, 4, 8];
    } else if (
      gameBoard[2] === piece &&
      gameBoard[4] === piece &&
      gameBoard[6] === piece
    ) {
      win = true;
      strike = [2, 4, 6];
    }
    for (let i = 0; i < board.length; i++) {
      if (
        i < 3 &&
        gameBoard[i] === piece &&
        gameBoard[i + 3] === piece &&
        gameBoard[i + 6] === piece
      ) {
        win = true;
        strike = [i, i + 3, i + 6];
        break;
      } else if (
        i % 3 === 0 &&
        gameBoard[i] === piece &&
        gameBoard[i + 1] === piece &&
        gameBoard[i + 2] === piece
      ) {
        win = true;
        strike = [i, i + 1, i + 2];
        break;
      } else if (gameBoard[i] === " ") {
        filled = false;
      }
    }

    if (win) {
      return {
        winner: player,
        strike: strike,
      };
    } else if (filled) {
      return {
        winner: "draw",
        strike: [],
      };
    }

    return 0;
  };

  const placePiece = (position) => {
    if (board[position] === " " && !gameOver) {
      board[position] = currentPlayer.piece;
      const consequence = checkBoard(board, currentPlayer);
      if (consequence) {
        gameOver = true;
        if (consequence.winner === "draw") {
          result.win = "The game ended in a draw";
        } else {
          result.win = `${consequence.winner.name} won the game!`;
          result.strike = consequence.strike;

          // Increment player score
          if (consequence.winner === players[0]) scores[0]++;
          else scores[1]++;
        }
        // Set first player for each round
        firstPlayer = firstPlayer === players[0] ? players[1] : players[0];
      }
      // Swap the current player after each piece placement
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

  const minimax = (state, depth, alpha, beta, maximizingPlayer, player) => {
    // Static analysis
    const playerToCheck = player === players[0] ? players[1] : players[0];
    const winner = checkBoard(state, playerToCheck).winner;
    if (winner || depth == 0) {
      if (winner === players[0]) {
        return {
          evaluation: 1,
        };
      } else if (winner === players[1]) {
        return {
          evaluation: -1,
        };
      } else {
        return {
          evaluation: 0,
        };
      }
    }

    /*
     ** Here, the maximizing player is the player holding "X" and
     ** the minimizing player is the player holding "O"
     */

    if (maximizingPlayer) {
      // Moves for maximizing player
      let maximumEvaluation = {
        evaluation: -Infinity,
        position: undefined,
      };
      let newState;

      /*
       ** Recursively scan every single possible placements until
       ** all squares are filled
       */
      for (let position = 0; position < state.length; position++) {
        if (state[position] === " ") {
          newState = state.slice();
          newState[position] = player.piece;
          const evaluation = minimax(
            newState,
            depth - 1,
            alpha,
            beta,
            false,
            players[1]
          ).evaluation;

          /*
           ** Replace the previous maximum evaluation with larger
           ** calculated evaluation
           */
          if (evaluation > maximumEvaluation.evaluation) {
            maximumEvaluation.evaluation = evaluation;
            maximumEvaluation.position = position;
          }

          // Alpha-Beta pruning
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break;
        }
      }
      return maximumEvaluation;
    } else {
      // Moves for minimizing player
      let minimumEvaluation = {
        evaluation: +Infinity,
        position: undefined,
      };
      for (let position = 0; position < state.length; position++) {
        if (state[position] === " ") {
          let newState = state.slice();
          newState[position] = player.piece;
          const evaluation = minimax(
            newState,
            depth - 1,
            alpha,
            beta,
            true,
            players[0]
          ).evaluation;

          /*
           ** Replace the previous minimum evaluation with smaller
           ** calculated evaluation
           */
          if (evaluation < minimumEvaluation.evaluation) {
            minimumEvaluation.evaluation = evaluation;
            minimumEvaluation.position = position;
          }

          // Alpha-Beta pruning
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break;
        }
      }
      return minimumEvaluation;
    }
  };

  const placeComputerPiece = () => {
    if (currentPlayer.name === "Computer") {
      let emptyBoard;
      if (firstPlayer === currentPlayer) {
        emptyBoard = true;
        for (let i = 0; i < board.length; i++) {
          if (board[i] !== " ") {
            emptyBoard = false;
          }
        }
      }

      if (difficulty === "easy" || emptyBoard) {
        let position = Math.floor(Math.random() * 9);
        while (!placePiece(position)) {
          position = Math.floor(Math.random() * 9);
        }
      } else {
        const isMaximizing = currentPlayer === players[0];
        const position = minimax(
          board,
          8,
          -Infinity,
          +Infinity,
          isMaximizing,
          currentPlayer
        ).position;

        let losingChance = 0;
        if (difficulty == "normal") losingChance = 35;
        else if (difficulty == "hard") losingChance = 25;

        if (Math.floor(Math.random() * 100) + 1 <= losingChance) {
          let randomPosition = Math.floor(Math.random() * 9);
          while (!placePiece(randomPosition)) {
            randomPosition = Math.floor(Math.random() * 9);
          }
        } else {
          placePiece(position);
        }
        return true;
      }
    }
    return false;
  };

  return {
    resetBoard,
    getBoard,
    getMode,
    getDifficulty,
    getGameOver,
    getResult,
    getPlayers,
    getFirstPlayer,
    getCurrentPlayer,
    getScores,
    setMode,
    setDifficulty,
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
  const turnContainer = document.querySelector(".turn");
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
  for (let i = 0; i < game.getBoard().length; i++) {
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

    // Update the player turn indicator
    const player = game.getCurrentPlayer().name;
    turnContainer.textContent =
      player === "You" ? "Your turn" : `${player}'s turn`;

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
        game.placeComputerPiece();
        updateBoard();
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
      if (
        game.getMode() === "computer" &&
        !game.getGameOver() &&
        game.getCurrentPlayer().name === "Computer"
      ) {
        setTimeout(() => {
          game.placeComputerPiece();
          updateBoard();
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
        const playerName = playerData.get("player")
          ? playerData.get("player")
          : "You";
        if (playerPiece === "X") {
          playerNames = [playerName, "Computer"];
        } else {
          playerNames = ["Computer", playerName];
        }
        game.setDifficulty(playerData.get("difficulty"));
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
