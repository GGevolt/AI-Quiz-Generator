import loadQuiz from "../../database/readData.js";

const DB_NAME = "QuizDatabase";
const DB_VERSION = 1;

const getIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return parseInt(urlParams.get("id"), 10) || -1; // Convert to number and default to -1 if not found
};

document.addEventListener("DOMContentLoaded", async function () {
  const quizId = getIdFromUrl();
  if (quizId === -1) {
    console.error("❌ Quiz ID not found");
    return;
  }

  const quizObject = await loadQuiz(quizId);
  const userAnswers = await getUserAnswers(quizId);

  const score = quizObject.quiz.totalScore;
  const questions = quizObject.questions;

  const scoreSpan = document.getElementById("user-score");
  scoreSpan.textContent = `${score}/${questions.length}`;

  const resultContainer = document.getElementById("result");
  resultContainer.innerHTML = "";

  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index]; // Lấy câu trả lời của người dùng
    const isCorrect = userAnswer === question.correct; // Kiểm tra đúng/sai

    // Tạo một div chứa từng câu hỏi và kết quả
    const questionItem = document.createElement("div");
    questionItem.classList.add("question-item");

    // Thẻ câu hỏi
    const questionText = document.createElement("p");
    questionText.classList.add("question-text");
    questionText.textContent = `${index + 1}. ${question.question}`;

    // Thẻ câu trả lời của người dùng
    const userAnswerText = document.createElement("p");
    userAnswerText.classList.add("user-answer");
    userAnswerText.classList.add(isCorrect ? "correct" : "incorrect");
    userAnswerText.innerHTML = isCorrect
      ? `✔️ Your Answer: ${userAnswer}`
      : `❌ Your Answer: ${userAnswer || "No answer"}`;

    // Thẻ câu trả lời đúng
    const correctAnswerText = document.createElement("p");
    correctAnswerText.classList.add("correct-answer");
    correctAnswerText.textContent = `Correct Answer: ${question.correct}`;

    // Thẻ giải thích đáp án
    const explanationText = document.createElement("p");
    explanationText.classList.add("answer-explanation");
    explanationText.textContent = `Explanation: ${question.description}`;

    // Thêm vào container
    questionItem.appendChild(questionText);
    questionItem.appendChild(userAnswerText);
    questionItem.appendChild(correctAnswerText);
    questionItem.appendChild(explanationText);

    resultContainer.appendChild(questionItem);
  });
});

// Get answer of user
function getUserAnswers(quizId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onsuccess = function (event) {
      let db = event.target.result;
      let transaction = db.transaction(["UserProgress"], "readonly");
      let store = transaction.objectStore("UserProgress");

      let getRequest = store.get(quizId);

      getRequest.onsuccess = function () {
        if (getRequest.result && getRequest.result.answers) {
          resolve(getRequest.result.answers);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = function () {
        reject("Lỗi khi lấy dữ liệu UserProgress");
      };

      transaction.onerror = function () {
        reject("Lỗi transaction");
      };
    };

    request.onerror = function () {
      reject("Lỗi mở indexDb");
    };
  });
}
