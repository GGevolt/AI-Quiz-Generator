function readQuiz(id) {
  return new Promise((resolve, reject) => {
    let dbRequest = indexedDB.open("QuizDatabase", 1);

    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["Quizz"], "readonly");
      const store = transaction.objectStore("Quizz");

      // Get quizz
      const request = store.get(id);

      request.onsuccess = () => {
        let results = request.result;
        console.log(results);
        resolve(results);
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

export default readQuiz;
