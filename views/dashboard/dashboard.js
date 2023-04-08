/**
 * Button mode
 */
const btn_mode = document.getElementById("btn-mode");
let mode;
btn_mode.addEventListener("click", function (e) {
    if (document.body.classList.contains("dark-mode")) {
        setLight();
    }
    else {
        setDark();
    }
});
function setDark() {
    btn_mode.children[0].children[0].textContent = "light_mode";
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
    mode = "dark";
}

function setLight() {
    btn_mode.children[0].children[0].textContent = "dark_mode";
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    mode = "light";
}


/**
 * Menu
 */
function openMenuPage($el) {
    $el.classList.add("is-active");
}

function closeMenuPage($el) {
    $el.classList.remove("is-active");
}

function closeAllMenuPages() {
    (document.querySelectorAll(".menu-list li a") || []).forEach((link) => {
        closeMenuPage(link);
        const e = document.getElementById(link.dataset.target);
        if (e) closeMenuPage(e);
    });
}
(document.querySelectorAll(".menu-list li a") || []).forEach((link) => {
    link.addEventListener("click", () => {
        const e = document.getElementById(link.dataset.target);
        if (!e) return;

        closeAllMenuPages();
        openMenuPage(link);
        openMenuPage(e);
    });
});