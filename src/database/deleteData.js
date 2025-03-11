const DB_NAME = "QuizDatabase";
const DB_VERSION = 1;
function deleteQuizWithQuestions(quizzId) {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(
      ["Quizz", "Questions", "UserProgress"],
      "readwrite"
    );

    const quizzStore = transaction.objectStore("Quizz");
    const questionStore = transaction.objectStore("Questions");
    const UserProgressStore = transaction.objectStore("UserProgress");

    // Xóa quizz trước
    quizzStore.delete(quizzId);

    // Xóa tất cả question có quizzId tương ứng
    const index = questionStore.index("quizzId");
    const request = index.openCursor(IDBKeyRange.only(quizzId));

    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        questionStore.delete(cursor.primaryKey);
        cursor.continue(); // Tiếp tục xóa các question tiếp theo
      }
    };
    //Delete user progress
    UserProgressStore.delete(quizzId);

    transaction.oncomplete = function () {
      console.log(`Deleted quiz ${quizzId} and related questions.`);
    };

    transaction.onerror = function () {
      console.error("Error deleting quiz and questions.");
    };
  };
}

export default deleteQuizWithQuestions;
