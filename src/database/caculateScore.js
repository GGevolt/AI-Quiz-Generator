const DB_NAME = "QuizDatabase";
const DB_VERSION = 1;

function caculateScore(quizzObj, answersArr) {
  //Caculate score
  let score = 0;
  quizzObj.questions.forEach((question, index) => {
    if (question.correct === answersArr[index]) {
      score += 1;
    }
  });

  // Save to db
  let dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

  dbRequest.onsuccess = function (event) {
    let db = event.target.result;
    let transaction = db.transaction(["Quizz"], "readwrite");
    let store = transaction.objectStore("Quizz");

    // querry by id
    let getRequest = store.get(quizzObj.quiz.id);

    // on success
    getRequest.onsuccess = function () {
      // Trả về object trong bảng
      let quizzData = getRequest.result;
      if (quizzData) {
        quizzData.totalScore = score;
        let updateRequest = store.put(quizzData);

        updateRequest.onsuccess = function () {
          console.log("Đã cập nhật totalScore thành công!");
        };

        updateRequest.onerror = function () {
          console.log("Lỗi khi cập nhật totalScore!");
        };
      } else {
        console.log("Không cần cập nhật");
      }
    };

    transaction.onerror = function () {
      console.log("Lỗi transaction");
    };
  };

  dbRequest.onerror = function () {
    console.log("Lỗi khi mở IndexedDB");
  };

  return score;
}

export default caculateScore;
