const openRequest = indexedDB.open("QuizDatabase", 1);

openRequest.onupgradeneeded = function (event) {
  let db = event.target.result;

  // 📂 Tạo object store "Quizz"
  if (!db.objectStoreNames.contains("Quizz")) {
    let quizzStore = db.createObjectStore("Quizz", {
      keyPath: "id",
      autoIncrement: true,
    });
    quizzStore.createIndex("topic", "topic", { unique: false });
    quizzStore.createIndex("status", "status", { unique: false });
  }

  // 📂 Tạo object store "Questions"
  if (!db.objectStoreNames.contains("Questions")) {
    let questionsStore = db.createObjectStore("Questions", {
      keyPath: "id",
      autoIncrement: true,
    });
    questionsStore.createIndex("quizzId", "quizzId", { unique: false });
  }

  // 📂 Tạo object store "UserProgress"
  if (!db.objectStoreNames.contains("UserProgress")) {
    let userProgressStore = db.createObjectStore("UserProgress", {
      keyPath: "quizzId",
    });
    userProgressStore.createIndex("quizzId", "quizzId", { unique: true });
  }

  console.log("Database setup complete! ✅");
};

openRequest.onsuccess = function (event) {
  console.log("Database opened successfully! 🚀");
};

openRequest.onerror = function (event) {
  console.error("Error opening database:", event.target.error);
};
