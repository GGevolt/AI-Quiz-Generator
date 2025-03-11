export default function checkQuiz(topic) {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open("QuizDatabase", 1);

        dbRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["Quizz"], "readonly");
            const quizzStore = transaction.objectStore("Quizz");

            const request = quizzStore.openCursor();
            request.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    const quiz = cursor.value;
                    if (quiz.topic === topic && quiz.totalScore === null) {
                        resolve(true); // Nếu topic trùng & score là null, trả về true
                        return;
                    }
                    cursor.continue();
                } else {
                    resolve(false); // Không tìm thấy điều kiện phù hợp, trả về false
                }
            };

            request.onerror = function () {
                reject("❌ Error checking topic.");
            };
        };

        dbRequest.onerror = function () {
            reject("❌ Error opening database.");
        };
    });
}
