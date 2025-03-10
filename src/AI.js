import API_KEY from "../config.js";

import addData from "./database/addData.js";

const DB_NAME = "QuizDatabase";
const DB_VERSION = 1;

const SchemaType = {
  ARRAY: "ARRAY",
  OBJECT: "OBJECT",
  STRING: "STRING",
};

const schema = {
  description: "List of questions and answers",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      question: {
        type: SchemaType.STRING,
        description: "The question about the theme",
        nullable: false,
      },
      answers: {
        type: SchemaType.ARRAY,
        description: "List of possible answers",
        items: {
          type: SchemaType.STRING,
        },
        minItems: 4,
        maxItems: 4,
      },
      correctAnswer: {
        type: SchemaType.STRING,
        description: "The correct answer",
        nullable: false,
      },
      explanation: {
        type: SchemaType.STRING,
        description: "Explanation of the correct answer",
        nullable: false,
      },
    },
    required: ["question", "answers", "correctAnswer", "explanation"],
  },
};

document.addEventListener("componentLoaded", function () {
  console.log("DOM fully loaded and parsed"); // Check if the DOM is fully loaded

  const generateQuizButton = document.getElementById("gen-btn");
  if (generateQuizButton) {
    console.log("Button found");
    generateQuizButton.addEventListener(
      "click",
      debounce(function () {
        const themeInput = document.getElementById("theme-input").value; // Add the id of the theme input
        const languageInput = document.getElementById("language-select").value; // Add the id of the language input
        const difficultyInput =
          document.getElementById("difficulty-select").value; // Add the id of the difficulty input
        const questionNumbers =
          document.getElementById("questions-count").value; // Add the id of the question numbers input
        if (!themeInput) {
          console.error("Theme input is empty");
          return;
        }

        const prompt = `Generate a quiz about ${themeInput} in ${languageInput}. The quiz should contain ${questionNumbers} ${difficultyInput} questions. Each question should have 4 possible answers, and only one of them should be correct. Indicate the correct answer and provide an explanation for the correct answer.`;

        console.log("Fetching data...");
        const preview = document.getElementById("questions-preview");
        preview.classList.remove("open");
        const loader = document.getElementById("loader");
        loader.classList.add("open");
        fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
            API_KEY,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                response_mime_type: "application/json",
                response_schema: schema,
              },
            }),
            keepalive: true,
          }
        )
          .then((response) => response.json())
          .then((data) => {
            console.log("Response data:", data); // Debugging: log the response data
            const quizObject = dataProcessing(themeInput, data);
            loader.classList.remove("open");
            if (quizObject) {
              // This the place to do something with the quiz object like save into a database or display it on the page
              displayPreview(quizObject);
            } else {
              console.error("Failed to process quiz data");
              alert("Failed to process quiz data");
            }
          })
          .catch((error) => {
            loader.classList.remove("open");
            console.error("Error:", error);
          });
      }, 300)
    );
  } else {
    console.error("Button not found");
  }
});

function dataProcessing(themeInput, data) {
  if (!data.candidates || !Array.isArray(data.candidates)) {
    console.error("Invalid data format:", data);
    return;
  }

  const quizData = data.candidates[0].content;
  console.log("Quiz data:", quizData); // Debugging: log the quiz data

  if (!quizData.parts || !Array.isArray(quizData.parts)) {
    console.error("Invalid questions format:", quizData);
    return;
  }

  const questionsText = quizData.parts[0].text; // Extract the actual quiz content
  console.log("Questions Text:", questionsText); // Debugging: log the questions text

  let questions;
  try {
    questions = JSON.parse(questionsText);
  } catch (error) {
    console.error("Error parsing quiz data:", error);
    return;
  }

  console.log("Questions:", questions); // Debugging: log the questions

  if (!questions || !Array.isArray(questions)) {
    console.error("Invalid questions format:", questions);
    return;
  }

  const quizObject = {
    theme: themeInput,
    questions: questions.map((q) => ({
      question: q.question,
      answers: q.answers,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    })),
  };

  // addData(quizObject);
  // loadQuiz(4);

  console.log("Quiz Object:", quizObject); // Debugging: log the quiz object

  return quizObject;
}

function displayPreview(quizObject) {
  const preview = document.getElementById("questions-preview");
  preview.innerHTML = `
    <h2>👁️ Quiz Preview</h2>
    <a href="#" class="start-btn">🚀 Start</a>
    <div class="questions-list"></div>
  `; // Clear existing content and add template
  preview.classList.add("open");
  const questionsList = preview.querySelector(".questions-list");

  quizObject.questions.forEach((q, index) => {
    const questionElement = document.createElement("div");
    questionElement.classList.add("question");

    const questionNumber = document.createElement("span");
    questionNumber.classList.add("question-number");
    questionNumber.textContent = `${index + 1}. `;

    const questionText = document.createElement("span");
    questionText.classList.add("question-text");
    questionText.textContent = q.question;

    questionElement.appendChild(questionNumber);
    questionElement.appendChild(questionText);
    questionsList.appendChild(questionElement);
  });

  const startButton = preview.querySelector(".start-btn");
  startButton.addEventListener("click", function () {
    addData(quizObject)
      .then((quizzId) => {
        const encodedId = encodeURIComponent(quizzId);
        window.location.href = `src/components/QuizTest/QuizTest.html?id=${encodedId}`;
      })
      .catch((error) => {
        alert(`Failed to add quiz to databasse: ${error}`);
      });
  });
}

// Debounce function to limit the rate at which a function can fire. This is so user can't spam/double the button
function debounce(func, delay) {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}
