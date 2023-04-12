// Variables

var menuButton = document.querySelector('#menuButton');
var menu = document.querySelector('nav');

// Open Menu

menuButton.addEventListener('click', function () {
    menu.classList.toggle('is__open');
});
