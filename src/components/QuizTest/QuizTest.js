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
});
