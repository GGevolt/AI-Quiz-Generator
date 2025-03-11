import loadQuiz from "../../database/readData.js";
import caculateScore from "../../database/caculateScore.js";
import saveUserProgress from "../../database/updateData.js";
import readQuiz from "../../database/readQuiz.js";
import getUserProgress from "../../database/getUserProgess.js";

const getIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return parseInt(urlParams.get("id"), 10) || -1; // Convert to number and default to -1 if not found
};

document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOM fully loaded and parsed");
  const quizId = getIdFromUrl();
  if (quizId === -1) {
    console.error("❌ Quiz ID not found");
    return;
  }
  displayQuizInfo(quizId);
  const quizObject = await loadQuiz(quizId);
  const questsContainer = document.getElementById("quest-container");
  const UserProgress = await getUserProgress(quizId);
  if (UserProgress) {
    displayQuestions(quizObject, questsContainer, UserProgress.answers);
  } else {
    displayQuestions(quizObject, questsContainer);
  }
  if (quizObject.quiz.totalScore !== null) {
    console.log("hello");
    displayResult(quizObject);
  }
  const submitBtn = document.getElementById("submit-quiz");
  //submit button event listener
  submitBtn.addEventListener("click", () => {
    const answers = [];
    //get all selected answers
    quizObject.questions.forEach((q, index) => {
      const selectedAnswer = document.querySelector(
        `input[name="answer${index}"]:checked`
      );
      if (selectedAnswer) {
        answers.push(selectedAnswer.value);
      } else {
        answers.push(null);
      }
    });
    caculateScore(quizObject, answers);
    // window.location.href = `../QuizResult/QuizResult.html?id=${quizObject.quiz.id}`;
    saveUserProgress(quizId, answers, "Completed");
    displayResult(quizObject);
  });
});

function displayResult(quizObject) {
  // Highlight correct and incorrect answers
  quizObject.questions.forEach((question, index) => {
    const correctAnswer = question.correct;
    const selectedRadio = document.querySelector(
      `input[name="answer${index}"]:checked`
    );

    // Find the correct answer element
    const allRadios = document.querySelectorAll(`input[name="answer${index}"]`);
    let correctRadio = null;

    allRadios.forEach((radio) => {
      if (radio.value === correctAnswer) {
        correctRadio = radio;
      }
    });

    if (correctRadio) {
      // Always highlight the correct answer
      correctRadio.closest(".answer-item").classList.add("success");
    }

    // If user selected an answer
    if (selectedRadio && selectedRadio.value !== correctAnswer) {
      // If it's wrong, mark it as fail
      selectedRadio.closest(".answer-item").classList.add("fail");
    }

    const explanationDiv = document.getElementById(`explanation-${index}`);
    if (explanationDiv) {
      explanationDiv.style.display = "block";
    }
  });

  // Disable all radio inputs after submission
  const allRadioInputs = document.querySelectorAll('input[type="radio"]');
  allRadioInputs.forEach((input) => {
    input.disabled = true;
  });

  // Change submit button text and disable it
  submitBtn.textContent = "Quiz Submitted";
  submitBtn.disabled = true;
}

async function displayQuizInfo(quizId) {
  const quizInfo = await readQuiz(quizId);
  document.getElementById("topic-name").textContent = quizInfo.topic;
  document.getElementById("difficulty-name").textContent = quizInfo.difficulty;
  document.getElementById("id-name").textContent = `ID: ${quizId}`;
  // Format date
  const date = new Date(quizInfo.createdAt);
  const formattedDate =
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.getElementById("date-name").textContent = formattedDate;
}

function displayQuestions(quizObject, container, userAnswers = {}) {
  quizObject.questions.forEach((q, index) => {
    const questionBox = document.createElement("div");
    questionBox.classList.add("question-box");
    questionBox.innerHTML = `<p>${index + 1}. ${q.question}</p>`;

    const answerBox = document.createElement("div");
    answerBox.classList.add("answer-box");

    q.options.forEach((option, optionIndex) => {
      const answerItem = document.createElement("label");
      answerItem.classList.add("answer-item");

      // Kiểm tra xem option có phải là câu trả lời đã lưu không
      const isChecked = userAnswers[index] === option ? "checked" : "";

      answerItem.innerHTML = `
        <input type="radio" name="answer${index}" value="${option}" ${isChecked} />
        <span>${String.fromCharCode(65 + optionIndex)}. ${option}</span>
      `;

      // Lưu lại câu trả lời khi chọn
      const inputElement = answerItem.querySelector("input");
      inputElement.addEventListener("change", (e) => {
        userAnswers[index] = e.target.value;
        saveUserProgress(quizObject.quiz.id, userAnswers, "Pending"); // Lưu với trạng thái pending
      });

      answerBox.appendChild(answerItem);
    });

    // Create explanation div (hidden by default)
    const explanationDiv = document.createElement("div");
    explanationDiv.classList.add("explanation-box");
    explanationDiv.id = `explanation-${index}`;
    explanationDiv.style.display = "none"; // Hidden by default
    explanationDiv.innerHTML = `
      <div class="explanation-content">
        <div class="explanation-header">
          <i class="fas fa-info-circle"></i> Explanation
        </div>
        <p>${q.description || "No explanation available."}</p>
      </div>
    `;

    container.appendChild(questionBox);
    container.appendChild(answerBox);
    container.appendChild(explanationDiv);
  });
}

const homeButton = document.querySelector(".save-button");
if (homeButton) {
  homeButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "../../../index.html";
  });
}
