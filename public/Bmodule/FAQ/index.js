document.querySelectorAll('.accordion').forEach(accordion => {
    const iconDown = accordion.querySelector('.icon');
    const iconUp = accordion.querySelector('.icon2');
    const sidebar = accordion.nextElementSibling;

    iconDown.addEventListener('click', () => {
        closeAllAccordions();
        openAccordion(iconDown, iconUp, sidebar, accordion.parentElement);
    });

    iconUp.addEventListener('click', () => {
        closeAccordion(iconDown, iconUp, sidebar, accordion.parentElement);
    });
});

function closeAllAccordions() {
    document.querySelectorAll('.accordionBox').forEach(box => {
        const iconDown = box.querySelector('.icon'); 
        const iconUp = box.querySelector('.icon2'); 
        const sidebar = box.querySelector('.sidebar'); 
        closeAccordion(iconDown, iconUp, sidebar, box); 
    });
}

function openAccordion(iconDown, iconUp, sidebar, accordionBox) {
    sidebar.style.transform = 'translateY(0px)'; 
    iconUp.style.display = 'block';
    iconDown.style.display = 'none'; 
    accordionBox.style.marginBottom = '150px';
}

function closeAccordion(iconDown, iconUp, sidebar, accordionBox) {
    sidebar.style.transform = 'translateY(-100px)'; 
    iconDown.style.display = 'block';
    iconUp.style.display = 'none'; 
    accordionBox.style.marginBottom = '50px';
}