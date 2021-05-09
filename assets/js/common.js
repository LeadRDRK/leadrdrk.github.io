"use strict";
const maxOffset = 5;
function initMouseMove() {
    var elements = document.getElementsByClassName("mouse-move");
    // don't react to touch inputs
    var usingTouch = false;
    document.addEventListener("touchend", () => {
        usingTouch = true;
    });
    document.addEventListener("mousemove", e => {
        if (usingTouch) {
            usingTouch = false;
            return;
        }
        for (var i = 0; i < elements.length; ++i) {
            var element = elements[i];
            var scaleX = (e.clientX - window.innerWidth/2) / window.innerWidth;
            element.style.left = maxOffset * scaleX + "px";
            var scaleY = (e.clientY - window.innerHeight/2) / window.innerHeight;
            element.style.top = maxOffset * scaleY + "px";
        }
    });
}

function initNavbar() {
    var burger = document.getElementById("navbarBurger");
    var content = document.getElementById("navbarContent");
    burger.addEventListener("click", () => {
        content.classList.toggle("active");
    })
}

initMouseMove();
initNavbar();