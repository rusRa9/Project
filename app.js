var request = indexedDB.open("userSettings", 1);
var db;

request.onerror = function(event) {
  console.error("Database error: " + event.target.errorCode);
};

request.onsuccess = function(event) {
  db = event.target.result;
};

request.onupgradeneeded = function(event) {
  var db = event.target.result;
  var objectStore = db.createObjectStore("settings", { keyPath: "name" });
};

function saveApiKey(apiKey) {
  var transaction = db.transaction(["settings"], "readwrite");
  var objectStore = transaction.objectStore("settings");
  var request = objectStore.put({ name: "apiKey", value: apiKey });
  
  request.onsuccess = function(event) {
    console.log("API key saved successfully.");
  };

  request.onerror = function(event) {
    console.error("Unable to save API key.");
  };
}

async function getApiKey() {
  return new Promise((resolve, reject) => {
    var transaction = db.transaction(["settings"], "readonly");
    var objectStore = transaction.objectStore("settings");
    var request = objectStore.get("apiKey");
    
    request.onsuccess = function(event) {
      resolve(event.target.result.value);
    };
    
    request.onerror = function(event) {
      reject("Unable to retrieve API key.");
    };
  });
}

async function sendRequest(message) {
    const apiKey = await getApiKey();
    const url = "https://api.openai.com/v1/completions";
    const data = {
        model: "text-davinci-002",
        prompt: message,
        max_tokens: 50
    };
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(data)
    };
    try {
        const response = await fetch(url, options);
        const json = await response.json();
        return json.choices[0].text.trim();
    } catch (error) {
        console.error("Error:", error);
        return "Error processing request.";
    }
}

async function handleMessage(message) {
  const response = await sendRequest(message);
  displayResponse(response);
}

function displayResponse(response) {
  document.getElementById("response").innerText = response;
}

function clearInput() {
  document.getElementById("message").value = "";
}

document.getElementById("sendButton").addEventListener("click", async () => {
  const message = document.getElementById("message").value;
  handleMessage(message);
  clearInput();
});
