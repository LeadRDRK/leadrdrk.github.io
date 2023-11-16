var tocSidebar = document.getElementById("tocSidebar")!;
var content = document.getElementById("content")!;

function createTocLink(name: string, anchorId: string) {
    var a = document.createElement("a");
    a.className = "toc-link";
    a.href = "#" + anchorId;
    a.innerText = name;
    tocSidebar.appendChild(a);
    return a;
}

var sections: { heading: HTMLHeadingElement, tocLink: HTMLAnchorElement }[] = [];
content.querySelectorAll("h1").forEach((el) => {
    sections.push({
        heading: el,
        tocLink: createTocLink(el.innerText.slice(0, -2), el.id)
    });
});

window.addEventListener("scroll", function() {
    var sectionFound = false;
    for (var i = sections.length - 1; i >= 0; --i) {
        var section = sections[i];
        var linkClassList = section.tocLink.classList;
        if (linkClassList.contains("active"))
            linkClassList.remove("active");
        
        if (sectionFound)
            continue;

        var rect = section.heading.getBoundingClientRect();
        if ((rect.top - rect.height) < 32) {
            linkClassList.add("active");
            sectionFound = true;
        }
    }
}, { passive: true });