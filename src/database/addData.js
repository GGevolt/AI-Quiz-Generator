const DB_NAME = "QuizDatabase";
const DB_VERSION = 1;

function addData(quizObject) {
  return new Promise((resolve, reject) => {
    let dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

    dbRequest.onsuccess = function (event) {
      let db = event.target.result;
      let transaction = db.transaction(
        ["Quizz", "Questions", "UserProgress"],
        "readwrite"
      );

      let quizStore = transaction.objectStore("Quizz");
      let questionsStore = transaction.objectStore("Questions");
      let userProgressStore = transaction.objectStore("UserProgress");

      let quizData = {
        topic: quizObject.theme,
        createdAt: new Date().toISOString(),
        status: "Pending",
        totalScore: null,
      };
      let addQuizRequest = quizStore.add(quizData);
      addQuizRequest.onsuccess = function (event) {
        let quizzId = event.target.result; // ID của quiz mới

        console.log("Quiz added with ID:", quizzId);

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
    // // 📝 Thêm Quiz
    // let quiz1 = { id: 1, topic: "JavaScript",    createdAt: "2025-03-06", status: "Pending", totalScore: null };
    // quizzStore.add(quiz1);

    // // ❓ Thêm câu hỏi vào Quiz
    // let question1 = {
    //     id: 1,
    //     quizzId: 1,
    //     question: "What is `typeof null` in JS?",
    //     options: ["object", "null", "undefined", "number"],
    //     correct: 2,
    //     description: "\"null\" is a primitive value, but typeof null is \"object\" due to a legacy bug in JavaScript."
    // };

    // let question2 = {
    //     id: 2,
    //     quizzId: 1,
    //     question: "Which keyword declares a variable?",
    //     options: ["var", "let", "const", "function"],
    //     correct: 3,
    //     description: "\"const\" declares a variable that cannot be reassigned."
    // };

    // questionsStore.add(question1);
    // questionsStore.add(question2);

    // // 👤 Thêm tiến trình của người dùng
    // let userProgress = { quizzId: 1, answers: ["a", "b", "c", null, "d"], status: "Pending" };
    // userProgressStore.add(userProgress);

    // transaction.oncomplete = function () {
    //     console.log("Data added successfully! 🎯");
    // };

    // transaction.onerror = function (event) {
    //     console.error("Error adding data:", event.target.error);
    // };
  });
}

export default addData;
