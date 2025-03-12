import queryHistory from "../../database/queryHistory.js";
import deleteQuizWithQuestions from "../../database/deleteData.js";

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
      actionHtml = `<a href="../../components/QuizTest/QuizTest.html?id=${quiz.id}" class="resume-link">Review Quiz</a>`;
    } else {
      actionHtml = `<a href="../../components/QuizTest/QuizTest.html?id=${quiz.id}" class="resume-link">Resume Quiz</a>`;
    }

    // Create row HTML
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${quiz.topic}</td>
      <td><span class="badge ${badgeClass}">${quiz.difficulty}</span></td>
      <td class="score-cell">${
        quiz.totalScore !== null ? quiz.totalScore : "-"
      }/${quiz.questionsCount}</td>
      <td><span class="status ${statusValue.toLocaleLowerCase()}">${statusValue}</span></td>
      <td class="action-cell">
        ${actionHtml}
      </td>
      <td class="delete-cell">
        <button class="delete-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;

    // Xử lý sự kiện xóa quiz
    row
      .querySelector(".delete-button")
      .addEventListener("click", async function () {
        const confirmDelete = confirm(
          "Are you sure you want to delete this quiz?"
        );
        if (!confirmDelete) return;

        try {
          // Gọi API xóa quiz theo ID
          await deleteQuizWithQuestions(quiz.id);

          // Xóa hàng khỏi bảng ngay lập tức để phản hồi nhanh
          row.remove();

          // Cập nhật lại danh sách quiz từ database
          await loadQuizHistory();
        } catch (error) {
          console.error("Error deleting quiz:", error);
          alert("Failed to delete quiz. Please try again.");
        }
      });

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
