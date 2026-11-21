const burguer = document.getElementById("burguer");
const menu = document.getElementById("menu");

if (burguer && menu) {

    burguer.addEventListener("click", (event) => {
        event.stopPropagation();
        menu.classList.toggle("ativo");
        burguer.classList.toggle("aberto");
    });


    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            menu.classList.remove("ativo");
            burguer.classList.remove("aberto");
        });
    });


    document.addEventListener("click", (event) => {
        if (!menu.contains(event.target) && !burguer.contains(event.target)) {
            menu.classList.remove("ativo");
            burguer.classList.remove("aberto");
        }
    });
}