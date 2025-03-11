import loadQuiz from "../../database/readData.js";
import caculateScore from "../../database/caculateScore.js";
import saveUserProgress from "../../database/updateData.js";
import readQuiz from "../../database/readQuiz.js";

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

  const urlParams = new URLSearchParams(window.location.search);
  const answersParam = urlParams.get("answers");
  const userAnswers = answersParam ? JSON.parse(decodeURIComponent(answersParam)) : {};
  displayQuestions(quizObject, questsContainer,userAnswers);
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
    window.location.href = `../QuizResult/QuizResult.html?id=${quizObject.quiz.id}`;
    saveUserProgress(quizId, answers, "Completed");
    console.log(answers);
  });
});

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

    container.appendChild(questionBox);
    container.appendChild(answerBox);
  });

  console.log("Loaded answers:", userAnswers); // Kiểm tra log
}

const homeButton = document.querySelector(".save-button");
if (homeButton) {
  homeButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "../../../index.html";
  });
}