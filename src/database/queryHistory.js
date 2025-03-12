function queryHistory(topic, difficulty) {
  return new Promise((resolve, reject) => {
    let dbRequest = indexedDB.open("QuizDatabase", 1);

    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["Quizz"], "readonly");
      const store = transaction.objectStore("Quizz");

      // Get all quizzes
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result;

        // Filter by topic if provided
        if (topic && topic.trim() !== "") {
          const topicLowerCase = topic.toLowerCase().trim();
          results = results.filter(
            (quiz) =>
              quiz.topic && quiz.topic.toLowerCase().includes(topicLowerCase)
          );
        }

        // Filter by difficulty if provided
        if (difficulty && difficulty !== "All") {
          results = results.filter((quiz) => quiz.difficulty === difficulty);
        }

        console.log("✅ Filtered quizzes:", results);
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

export default queryHistory;
