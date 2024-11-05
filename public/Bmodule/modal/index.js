function modal(id, hide) {
    document.getElementById(id).addEventListener("click", () => document.getElementById("modal-wrap").style.display = hide);
}
modal("open-btn", "block");
modal("close-btn", "none");