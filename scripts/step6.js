const angryIa = document.querySelector(".angryIa");

function launchVideo() {
  angryIa.play();
}

angryIa.addEventListener("ended", () => {
  redirectToNextPage();
});

function redirectToNextPage() {
  window.location.href = "step7.html";
}

window.addEventListener("keydown", function (event) {
  if (event.code === "ArrowRight") {
    redirectToNextPage();
  }
});

window.addEventListener("keydown", function (event) {
  if (event.code === "ArrowDown") {
    window.location.href = "../index.html";
  }
});
