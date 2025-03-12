function addData(quizObject) {
  return new Promise((resolve, reject) => {
    let dbRequest = indexedDB.open("QuizDatabase", 1);

    dbRequest.onsuccess = function (event) {
      let db = event.target.result;
      let transaction = db.transaction(["Quizz", "Questions"], "readwrite");

      let quizStore = transaction.objectStore("Quizz");
      let questionsStore = transaction.objectStore("Questions");

      let quizData = {
        topic: quizObject.topic,
        createdAt: new Date().toISOString(),
        difficulty: quizObject.difficulty,
        questionsCount: quizObject.questions.length,
        // xóa status
        totalScore: null,
      };
      let addQuizRequest = quizStore.add(quizData);
      addQuizRequest.onsuccess = function (event) {
        let quizzId = event.target.result; // ID của quiz mới

        // Thêm từng câu hỏi vào Questions store
        let questionPromises = quizObject.questions.map((q) => {
          return new Promise((resolve, reject) => {
            let questionData = {
              quizzId: quizzId, // Liên kết với quiz vừa tạo
              question: q.question,
              options: q.answers, // Chuyển đổi answers -> options
              correct: q.correctAnswer, // Chuyển đổi correctAnswer -> correct
              description: q.explanation, // Chuyển đổi explanation -> description
            };

            let addQuestionRequest = questionsStore.add(questionData);
            addQuestionRequest.onsuccess = function () {
              console.log("Question added:", questionData);
              resolve();
            };

            addQuestionRequest.onerror = function () {
              console.error("Failed to add question:", questionData);
              reject();
            };
          });
        });

        Promise.all(questionPromises)
          .then(() => {
            resolve(quizzId);
          })
          .catch(() => {
            reject("Failed to add some questions");
          });
      };

      addQuizRequest.onerror = function () {
        console.error("Failed to add quiz");
        reject("Failed to add quiz");
      };
    };

    dbRequest.onerror = function () {
      console.error("Failed to open database");
      reject("Failed to open database");
    };
  });
}

export default addData;
