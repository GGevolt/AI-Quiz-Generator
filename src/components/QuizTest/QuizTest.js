import loadQuiz from "../../database/readData.js";

const getIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id") || "";
};
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");
  const quizId = getIdFromUrl();
  const quizObject = loadQuiz(quizId);
  console.log("Quiz Object:", quizObject.questions);
});
