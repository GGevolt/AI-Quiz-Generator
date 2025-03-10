export default function saveUserProgress(quizId, quizAnswer) {

    let dbRequest = indexedDB.open("QuizDatabase", 1);

    dbRequest.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction(["UserProgress"], "readwrite");
        let progressStore = transaction.objectStore("UserProgress");

        let progressData = {
            quizId: quizId,  // Liên kết với bài quiz
            answers: quizAnswer,  // Danh sách câu trả lời
            status: "Completed"
        };

        let request = progressStore.put(progressData);

        request.onsuccess = function () {
            console.log("✅ User progress saved!");
        };

        request.onerror = function () {
            console.error("❌ Error saving progress:", request.error);
        };
    };
}
