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

    if (answers.some((element) => element === null)) {
      if (
        !confirm(
          "Do you want to submit? There are questions you have not answered yet."
        )
      ) {
        return;
      }
    }

    const score = caculateScore(quizObject, answers);
    quizObject.quiz.totalScore = score;
    // window.location.href = `../QuizResult/QuizResult.html?id=${quizObject.quiz.id}`;
    saveUserProgress(quizId, answers, "Completed");
    displayResult(quizObject);
    // Change submit button text and disable it
    submitBtn.textContent = "Quiz Submitted";
    submitBtn.disabled = true;
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

  // Display score and retry button
  const scoreContainer = document.getElementById("info-item-score");
  const score = document.getElementById("info-item-score--text");
  const retryBtn = document.getElementById("retry-quiz");

  scoreContainer.style.display = "block";
  retryBtn.style.display = "block";

  score.innerText = `${quizObject.quiz.totalScore} / ${quizObject.quiz.questionsCount}`;

  retryBtn.addEventListener("click", async function () {
    await resetUserAnswers(quizObject.quiz.id);
    window.location.href = `../QuizTest/QuizTest.html?id=${quizObject.quiz.id}`;
  });
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

    // Create paragraph for question text
    const questionParagraph = document.createElement("p");
    questionParagraph.textContent = `${index + 1}. ${q.question}`;
    questionBox.appendChild(questionParagraph);

    const answerBox = document.createElement("div");
    answerBox.classList.add("answer-box");

    q.options.forEach((option, optionIndex) => {
      const answerItem = document.createElement("label");
      answerItem.classList.add("answer-item");

      // Create radio input
      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.name = `answer${index}`;
      radioInput.value = option;

      // Check if this option is the saved answer
      if (userAnswers[index] === option) {
        radioInput.checked = true;
      }

      // Create label text
      const labelText = document.createElement("span");
      labelText.textContent = `${String.fromCharCode(
        65 + optionIndex
      )}. ${option}`;

      // Append elements to answer item
      answerItem.appendChild(radioInput);
      answerItem.appendChild(labelText);

      // Add event listener to the radio input
      radioInput.addEventListener("change", (e) => {
        userAnswers[index] = e.target.value;
        saveUserProgress(quizObject.quiz.id, userAnswers, "Pending"); // Save with pending status
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

//Reset User's Answers
function resetUserAnswers(quizId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("QuizDatabase", 1);

    request.onsuccess = function (event) {
      let db = event.target.result;
      let transaction = db.transaction(["UserProgress", "Quizz"], "readwrite");

      let userProgressStore = transaction.objectStore("UserProgress");
      let quizzStore = transaction.objectStore("Quizz");

      // Lấy dữ liệu từ UserProgress
      let userProgressRequest = userProgressStore.get(quizId);
      userProgressRequest.onsuccess = function () {
        let userProgress = userProgressRequest.result;
        if (userProgress) {
          userProgress.answers = []; // Reset câu trả lời
          userProgressStore.put(userProgress);
        }
      };

      // Lấy dữ liệu từ Quizz
      let quizzRequest = quizzStore.get(quizId);
      quizzRequest.onsuccess = function () {
        let quizzData = quizzRequest.result;
        if (quizzData) {
          quizzData.totalScore = null; // Reset totalScore
          quizzStore.put(quizzData);
        }
      };

      transaction.oncomplete = function () {
        console.log(`Reset thành công cho quizId: ${quizId}`);
        resolve();
      };

      transaction.onerror = function () {
        console.error("Lỗi transaction khi reset dữ liệu");
        reject("Lỗi transaction khi reset dữ liệu");
      };
    };

    request.onerror = function () {
      console.error("Lỗi mở IndexedDB");
      reject("Lỗi mở IndexedDB");
    };
  });
}
