const video = document.querySelector("#step-2-video");
const canvas = document.querySelector("#step-2-canvas");
const context = canvas.getContext("2d");
const btn = document.querySelector(".btn");
const cursor = document.querySelector(".cursor");

let isVideo = false;
let model = null;

const modelParams = {
  flipHorizontal: true,
  maxNumBoxes: 20,
  iouThreshold: 0.5,
  scoreThreshold: 0.6,
};

const pseudoField = document.querySelector(".step2-pseudo-field");

function vocalQuestionAssistant(file) {
  return new Promise((resolve) => {
    let identity = new Audio(`../assets/sounds/${file}`);
    identity.onended = function () {
      resolve();
    };
    identity.play();
  });
}

function vocalResponseRecordUser() {
  return new Promise((resolve) => {
    var recognition = new webkitSpeechRecognition();
    recognition.lang = "fr-FR";

    recognition.onresult = function (event) {
      var response = event.results[0][0].transcript;
      response.toLowerCase();
      resolve(response);
    };

    recognition.start();
  });
}

async function initGame() {
  pseudoField.textContent = "_______";
  // demander pseudo
  await vocalQuestionAssistant("step2_identity.mp3");
  // écouter pseudo user
  const pseudoAsk = await vocalResponseRecordUser();
  pseudoField.textContent = pseudoAsk;
  // confirmation pseudo
  await vocalQuestionAssistant("step2_confirmation.mp3");
  // écouter confirmation
  const confirmAsk = await vocalResponseRecordUser();
  if (
    confirmAsk.includes("oui") ||
    confirmAsk.includes("ouais") ||
    confirmAsk.includes("ouaip")
  ) {
    const pseudo = pseudoAsk;
    setTimeout(function () {
      redirectToNextPage();
    }, 15000);
  } else {
    initGame();
  }
}

function startVideo() {
  handTrack.startVideo(video).then(() => {
    runDetection();
  });
}

startVideo();

function runDetection() {
  model.detect(video).then((predictions) => {
    model.renderPredictions(predictions, canvas, context, video);

    predictions.forEach((prediction) => {
      if (prediction.label !== "face") {
        const [x, y, width, height] = prediction.bbox;
        moveCursor(prediction.bbox, cursor);
        // closeHand(prediction);
      }
    });
    requestAnimationFrame(runDetection);
  });
}

function moveCursor(handBbox, cursor) {
  // Récupère les dimensions du canvas et de la page web
  const canvasWidth = canvas.offsetWidth;
  const canvasHeight = canvas.offsetHeight;
  const pageWidth = window.innerWidth;
  const pageHeight = window.innerHeight;

  // Calcule la position relative de la main dans le canvas
  const [x, y, width, height] = handBbox;
  const relativeX = (x + width / 2) / canvasWidth;
  const relativeY = (y + height / 2) / canvasHeight;

  // Adapte la position relative aux dimensions de la page web
  const cursorX = relativeX * pageWidth;
  const cursorY = relativeY * pageHeight;

  // Positionne le curseur sur la page
  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;
}

// Load the model.
handTrack.load(modelParams).then((lmodel) => {
  // Detect objects in the image.
  model = lmodel;
});

function checkCollision(block) {
  const cursorRect = cursor.getBoundingClientRect();
  if (
    cursorRect.left < block.right &&
    cursorRect.right > block.left &&
    cursorRect.top < block.bottom &&
    cursorRect.bottom > block.top
  ) {
    return block;
  }
}

// function closeHand(prediction) {
//   if (prediction.label === "closed") {
//     if (checkCollision(btn.getBoundingClientRect())) {
//       cursor.style.backgroundImage = "url('/images/closed-cursor.png')";
//     }
//   } else {
//     cursor.style.backgroundImage = "url('/images/open-cursor.png')";
//   }
// }

function redirectToNextPage() {
  window.location.href = "../html/step3.html";
}

window.addEventListener("keydown", function (event) {
  if (event.code === "ArrowDown") {
    redirectToNextPage();
  }
});
