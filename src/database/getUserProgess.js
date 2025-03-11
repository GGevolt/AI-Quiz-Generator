const DB_NAME = "QuizDatabase";
const DB_VERSION = 1;

function getUserProgress(quizId) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["UserProgress"], "readonly");
      const store = transaction.objectStore("UserProgress");

      const request = store.get(quizId);

      request.onsuccess = () => {
        let results = request.result;
        if (results) {
          resolve(results);
        }
      };

      request.onerror = () => {
        console.error("❌ Error querying quizzes:", request.error);
        reject(request.error);
      };

      transaction.onerror = (event) => {
        console.error("❌ Transaction error:", event.target.error);
        reject(event.target.error);
      };
    };

    dbRequest.onerror = () => {
      console.error("❌ Error opening database:", dbRequest.error);
      reject(dbRequest.error);
    };
  });
}

export default getUserProgress;
