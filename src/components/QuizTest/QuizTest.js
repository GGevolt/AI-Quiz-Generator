import loadQuiz from "../../database/readData.js";

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
  const quizObject = await loadQuiz(quizId);
  const questsContainer = document.getElementById("quest-container");
  displayQuestions(quizObject, questsContainer);
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
    console.log(answers);
  });
});

function displayQuestions(quizObject, container) {
  quizObject.questions.forEach((q, index) => {
    const questionBox = document.createElement("div");
    questionBox.classList.add("question-box");
    questionBox.innerHTML = `<p>${index + 1}. ${q.question}</p>`;

    const answerBox = document.createElement("div");
    answerBox.classList.add("answer-box");

    q.options.forEach((option, optionIndex) => {
      const answerItem = document.createElement("label");
      answerItem.classList.add("answer-item");
      answerItem.innerHTML = `
          <input type="radio" name="answer${index}" value="${option}" />
          <span>${String.fromCharCode(65 + optionIndex)}. ${option}</span>
        `;
      answerItem.querySelector("input").addEventListener("change", (e) => {
        //save here
      });
      answerBox.appendChild(answerItem);
    });

    container.appendChild(questionBox);
    container.appendChild(answerBox);
  });
}
