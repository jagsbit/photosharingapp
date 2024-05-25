const moreBtn = document.getElementById("more-btn")
const optionWindow = document.getElementById("more-options")
function makeWindowNotVisible(){
    optionWindow.classList.contains("notVisible") ? optionWindow.classList.remove("notVisible") : optionWindow.classList.add("notVisible");
}
moreBtn.addEventListener('click', makeWindowNotVisible)