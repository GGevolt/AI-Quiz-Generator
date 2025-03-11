import queryHistory from "../../database/queryHistory.js";

document.addEventListener("DOMContentLoaded", async function () {
  const searchInput = document.getElementById("search-topic");
  const difficultySelect = document.getElementById("history-difficulty");
  const tableBody = document.querySelector(".history-table tbody");

  // Initial load of all quiz history
  await loadQuizHistory();

  // Add event listeners for filtering
  searchInput.addEventListener("input", debounce(loadQuizHistory, 300));
  difficultySelect.addEventListener("change", loadQuizHistory);

  // Function to load quiz history with filters
  async function loadQuizHistory() {
    const topic = searchInput.value.trim();
    const difficulty = difficultySelect.value;

    try {
      // Query the database with filters
      const quizzes = await queryHistory(topic, difficulty);

      // Clear existing table rows
      tableBody.innerHTML = "";

      if (quizzes.length === 0) {
        // Display a message if no quizzes found
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `
            <td colspan="6" class="no-data">No quiz history found matching your filters</td>
          `;
        tableBody.appendChild(noDataRow);
      } else {
        // Render each quiz as a table row
        quizzes.forEach((quiz) => {
          const row = createQuizRow(quiz);
          tableBody.appendChild(row);
        });
      }
    } catch (error) {
      console.error("Error loading quiz history:", error);
      tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="error">Error loading quiz history. Please try again.</td>
          </tr>
        `;
    }
  }

  // Function to create a table row for a quiz
  function createQuizRow(quiz) {
    const row = document.createElement("tr");

    // Format date
    const date = new Date(quiz.createdAt);
    const formattedDate =
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Determine badge class based on difficulty
    let badgeClass = "easy";
    if (quiz.difficulty === "Medium") {
      badgeClass = "medium";
    } else if (quiz.difficulty === "Difficult") {
      badgeClass = "difficulty";
    }

    // Determine status class
    const statusValue = quiz.totalScore !== null ? "Completed" : "Pending";

    // Determine action link text and URL based on status
    let actionHtml;
    if (statusValue === "Completed") {
      // For completed quizzes, use a regular link
      actionHtml = `<a href="./src/components/QuizResult/QuizResult.html?id=${quiz.id}" class="review-link">Review Quiz</a>`;
    } else {
      // For pending quizzes, add a data attribute and special class
      actionHtml = `<a href="../../components/QuizTest/QuizTest.html?id=${quiz.id}" class="resume-link">Resume Quiz</a>`;
    }

    // Create row HTML
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${quiz.topic}</td>
      <td><span class="badge ${badgeClass}">${quiz.difficulty}</span></td>
      <td class="score-cell">${
        quiz.totalScore !== null ? quiz.totalScore : "-"
      }/10</td>
      <td><span class="status ${statusValue.toLocaleLowerCase()}">${statusValue}</span></td>
      <td class="action-cell">
        ${actionHtml}
      </td>
    `;

    return row;
  }

  // Debounce function to limit how often a function is called
  function debounce(func, delay) {
    let timeout;
    return function () {
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Add event listener for home button
  const homeButton = document.querySelector(".home-button");
  if (homeButton) {
    homeButton.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../../../index.html";
    });
  }

  // Add event listeners for review links
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("review-link")) {
      e.preventDefault();
      const quizId = e.target.getAttribute("href").split("=")[1];
      window.location.href = `../../components/QuizResult/QuizResult.html?id=${quizId}`;
    }
  });
});
