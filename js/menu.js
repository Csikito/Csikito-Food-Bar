/***********SHOW MENU************/
const navMenu = document.querySelector(".js-nav__menu");
const navToggle = document.querySelector(".js-nav__toggle");
const navClose = document.querySelector(".js-nav__close");
const navMenuObject = navMenu.children[0].children;
const navMenuArray = Object.values(navMenuObject);

navToggle.addEventListener("click", () => {
  navMenu.classList.add("show__menu");
});
navClose.addEventListener("click", () => {
  navMenu.classList.remove("show__menu");
});
navMenuArray.forEach((e) => {
  e.addEventListener("click", () => {
    navMenu.classList.remove("show__menu");
  });
});
