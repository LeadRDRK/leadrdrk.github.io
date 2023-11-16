var nrClassList = document.getElementById("navbarRoot")!.classList;
document.addEventListener("scroll", function() {
    if (window.scrollY < 10) nrClassList.remove("opaque")
    else nrClassList.add("opaque");
});