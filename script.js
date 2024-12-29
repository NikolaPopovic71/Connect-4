document.addEventListener("DOMContentLoaded", () => {
  const text = "Welcome to our Connect-4 Game!";
  let index = 0;
  const ROWS = 6;
  const COLS = 7;
  let currentPlayer = "player1";
  const board = [];
  const gameBoard = document.getElementById("game-board");
  const resetButton = document.getElementById("reset-button");
  let topRow;

  // Typewriter Effect
  function type() {
    const char = text.charAt(index);
    if (char === " ") {
      document.getElementById("typewriter").innerHTML += "&nbsp;";
    } else {
      document.getElementById("typewriter").innerHTML += char;
    }
    index++;
    if (index < text.length) {
      setTimeout(type, 110);
    } else {
      setTimeout(showGameBoard, 1000);
    }
  }

  // Show the game board
  function showGameBoard() {
    const welcomePage = document.getElementById("initial-welcome-page");
    if (!welcomePage || !gameBoard) {
      console.error("Missing required elements.");
      return;
    }

    welcomePage.style.display = "none";
    gameBoard.style.display = "grid";
    createTopRow();
    initializeBoard();
  }

  // Initialize the game board
  function initializeBoard() {
    board.length = 0;
    gameBoard.innerHTML = "";

    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = r;
        cell.dataset.col = c;
        gameBoard.appendChild(cell);
        row.push(null);
      }
      board.push(row);
    }
  }

  // Create the top row with tokens
  function createTopRow() {
    if (!topRow) {
      topRow = document.createElement("div");
      topRow.id = "top-row";
      document.body.insertBefore(topRow, gameBoard);
    }
    topRow.innerHTML = "";

    for (let c = 0; c < COLS; c++) {
      const token = document.createElement("button");
      token.classList.add("token", currentPlayer);
      token.dataset.col = c;
      token.addEventListener("click", () => makeMove(c));
      topRow.appendChild(token);
    }
  }

  // Make a move with falling animation
  function makeMove(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][col]) {
        board[r][col] = currentPlayer;

        // Find the target cell
        const cell = document.querySelector(
          `.cell[data-row="${r}"][data-col="${col}"]`
        );

        // Create a temporary token for animation
        const tempToken = document.createElement("div");
        tempToken.style.position = "absolute";
        tempToken.style.width = `${cell.offsetWidth}px`;
        tempToken.style.height = `${cell.offsetHeight}px`;
        tempToken.style.borderRadius = "50%"; // Keep the circular shape
        tempToken.style.backgroundColor =
          currentPlayer === "player1"
            ? "var(--clr-first)"
            : "var(--clr-second)"; // Set the color explicitly
        tempToken.style.boxShadow =
          "0 2px 4px rgba(0, 0, 0, 1), 0 10px 20px rgba(0, 0, 0, 0.4)"; // Match the token styling

        // Calculate the position
        const gameBoardRect = gameBoard.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();
        tempToken.style.left = `${cellRect.left}px`;
        tempToken.style.top = `${gameBoardRect.top - cellRect.height}px`;

        // Append the token to the body for animation
        document.body.appendChild(tempToken);

        // Animate the token falling
        gsap.to(tempToken, {
          duration: 0.5,
          top: `${cellRect.top}px`,
          ease: "power1.in",
          onComplete: () => {
            // Place the token in the cell
            cell.classList.add(currentPlayer);

            // Explicitly set the background color for the cell
            cell.style.backgroundColor =
              currentPlayer === "player1"
                ? "var(--clr-first)"
                : "var(--clr-second)";
            cell.style.backgroundImage = "none"; // Remove any background gradient
            cell.style.boxShadow = "inset 0 0 5px rgba(0, 0, 0, 0.5)";

            // Remove the temporary token
            tempToken.remove();

            // Check for a winner
            if (checkWinner(r, col)) {
              setTimeout(() => {
                showResultModal(`${currentPlayer.toUpperCase()} Wins!`);
              }, 500);
            } else if (board.flat().every((cell) => cell !== null)) {
              // Check for a draw
              setTimeout(() => {
                showResultModal("It's a Draw!");
              }, 500);
            } else {
              switchPlayer();
            }
          },
        });

        return;
      }
    }
  }

  // Switch to the next player
  function switchPlayer() {
    currentPlayer = currentPlayer === "player1" ? "player2" : "player1";

    document.querySelectorAll(".token").forEach((token) => {
      token.classList.remove("player1", "player2");
      token.classList.add(currentPlayer);
    });
  }

  // Check for a winner
  function checkWinner(row, col) {
    return (
      checkDirection(row, col, 1, 0) || // Horizontal
      checkDirection(row, col, 0, 1) || // Vertical
      checkDirection(row, col, 1, 1) || // Diagonal \
      checkDirection(row, col, 1, -1) // Diagonal /
    );
  }

  // Check a direction for 4 in a row
  function checkDirection(row, col, rowDir, colDir) {
    let count = 1;
    count += countConsecutive(row, col, rowDir, colDir);
    count += countConsecutive(row, col, -rowDir, -colDir);
    return count >= 4;
  }

  // Count consecutive cells
  function countConsecutive(row, col, rowDir, colDir) {
    let count = 0;
    let r = row + rowDir;
    let c = col + colDir;
    while (
      r >= 0 &&
      r < ROWS &&
      c >= 0 &&
      c < COLS &&
      board[r][c] === currentPlayer
    ) {
      count++;
      r += rowDir;
      c += colDir;
    }
    return count;
  }

  // Display modal with result
  function showResultModal(winnerText) {
    document.getElementById("winner").textContent = winnerText;
    document.getElementById("game-board").classList.add("blurred");
    document.getElementById("top-row").classList.add("blurred");
    document.getElementById("result-modal").style.display = "block";
  }

  // Reset game
  function resetGame() {
    document.getElementById("result-modal").style.display = "none";

    // Remove blur from the game board and top row
    document.getElementById("game-board").classList.remove("blurred");
    const topRow = document.getElementById("top-row");
    if (topRow) topRow.classList.remove("blurred");

    currentPlayer = "player1"; // Ensure the game starts with player 1
    initializeBoard();
    createTopRow(); // Recreate the top-row tokens to reset their state
  }

  const shareButton = document.getElementById("share-button");
  const hint = document.getElementById("click-hint");
  const socialsWrapper = document.querySelector(".socials-wrapper");

  const toggleSocials = () => {
    socialsWrapper.classList.toggle("active");

    // Hide the hint text once the image is clicked
    hint.style.display = "none";

    const shareButtonImage = shareButton.querySelector("img");
    if (
      shareButtonImage.src.includes(
        "ponITech%20-%20shorten%20logo_without_n.svg"
      )
    ) {
      shareButtonImage.src = "images/close.svg";
    } else {
      shareButtonImage.src =
        "images/ponITech%20-%20shorten%20logo_without_n.svg";
    }
  };

  shareButton.addEventListener("click", toggleSocials);

  resetButton.addEventListener("click", resetGame);

  type();
});
