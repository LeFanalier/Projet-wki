// js/app.js
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "primary": "#00E5FF",
                "background": "#0d1516",
                "surface-container": "#192122",
                "surface-container-low": "#151d1e",
                "on-background": "#dce4e5",
                "on-surface": "#dce4e5",
                "error": "#ffb4ab",
                "secondary": "#75d5e2",
                "tertiary": "#ffeac0",
                "surface-container-highest": "#2e3638",
            }
        }
    }
}

async function loadComponent(id, file) {
    const isSubPage = window.location.pathname.includes('/pages/');
    const pathPrefix = isSubPage ? '../' : '';
    try {
        const response = await fetch(pathPrefix + file);
        const text = await response.text();
        document.getElementById(id).innerHTML = text;
    } catch (err) { 
        console.error("Erreur chargement " + file, err); 
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadComponent('header-placeholder', 'includes/header.html');
    loadComponent('footer-placeholder', 'includes/footer.html');
});