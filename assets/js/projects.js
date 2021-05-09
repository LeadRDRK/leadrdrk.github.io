"use strict";

const projectView = document.getElementById("projectView");
const projectInfoCard = document.getElementById("projectInfoCard");
const projectCloseBtn = document.getElementById("projectCloseBtn");
const projectIFrame = document.getElementById("projectIFrame");
const fader = document.getElementById("fader");

const projectButtons = document.querySelectorAll(".projects-container a");
for (var i = 0; i < projectButtons.length; ++i)
{
    projectButtons[i].addEventListener("click", e => {
        if (e.currentTarget.classList.contains("disabled")) return;
        const projectPage = "/projectinfo/" + e.currentTarget.dataset.projectName;
        if (projectIFrame.src != projectPage) projectIFrame.src = projectPage;

        // show the elements
        projectView.classList.remove("hidden");
        projectInfoCard.classList.remove("hidden");
        fader.classList.remove("hidden");
        document.body.classList.add("stop-scrolling");
    });
}

projectCloseBtn.addEventListener("click", () => {
    // hide the elements
    projectView.classList.add("hidden");
    projectInfoCard.classList.add("hidden");
    fader.classList.add("hidden");
    document.body.classList.remove("stop-scrolling");
});