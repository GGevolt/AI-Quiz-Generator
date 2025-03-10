const DB_NAME = "QuizDatabase";
const DB_VERSION = 1;

async function getQuizData(quizId) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

    dbRequest.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(["Quizz", "Questions"], "readonly");
      // const transaction = db.transaction(["Quizz", "Questions", "UserProgress"], "readonly");

      const quizzStore = transaction.objectStore("Quizz");
      const questionsStore = transaction
        .objectStore("Questions")
        .index("quizzId");
      // const userProgressStore = transaction.objectStore("UserProgress");

      const quizPromise = new Promise((res, rej) => {
        const request = quizzStore.get(quizId);
        request.onsuccess = () => res(request.result || null);
        request.onerror = () => rej(request.error);
      });

      const questionsPromise = new Promise((res, rej) => {
        const request = questionsStore.getAll(quizId);
        request.onsuccess = () => res(request.result || []);
        request.onerror = () => rej(request.error);
      });

      // const progressPromise = new Promise((res, rej) => {
      //     const request = userProgressStore.get(quizId);
      //     request.onsuccess = () => res(request.result || null);
      //     request.onerror = () => rej(request.error);
      // });

      // Promise.all([quizPromise, questionsPromise, progressPromise])
      Promise.all([quizPromise, questionsPromise])
        .then(([quiz, questions]) => {
          resolve({ quiz, questions });
        })
        .catch(reject);
    };

    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

// 📌 Chỉ export loadQuiz (không export getQuizData)
export default async function loadQuiz(quizId) {
  try {
    const data = await getQuizData(quizId);
    console.log("✅ Quiz Data:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching quiz data:", error);
  }
}
