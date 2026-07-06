const uploadInput = document.querySelector("input[type='file']");

const loadingScreen = document.getElementById("loadingScreen");

const progressBar = document.getElementById("progressBar");

const loadingText = document.getElementById("loadingText");

const loadingSteps = [

    "Initializing AI Engine...",
    "Reading medical report...",
    "Scanning metadata...",
    "Detecting forged regions...",
    "Verifying signatures...",
    "Generating forensic analysis..."
];

uploadInput.addEventListener("change", () => {

    loadingScreen.style.display = "flex";

    let progress = 0;

    let step = 0;

    const interval = setInterval(() => {

        progress += 2;

        progressBar.style.width = progress + "%";

        if(progress % 18 === 0 && step < loadingSteps.length){

            loadingText.innerText = loadingSteps[step];

            step++;
        }

        if(progress >= 100){

            clearInterval(interval);

            setTimeout(() => {

                loadingScreen.style.display = "none";

            }, 800);
        }

    }, 80);
});