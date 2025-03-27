function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.querySelector('.content');
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    if (viewportWidth >= 769) {
        // desktop
        if (sidebar.classList.contains('hidden')) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('visible');
            content.classList.add('shifted');
        } else {
            sidebar.classList.remove('visible');
            sidebar.classList.add('hidden');
            content.classList.remove('shifted');
        }
    } else {
        // mobile
        sidebar.classList.toggle('mobile-visible');
    }
}

// toggle inside sidebar
document.getElementById('toggleBtnSidebar').addEventListener('click', toggleSidebar);

// external toggle button
document.getElementById('toggleBtnExternal').addEventListener('click', toggleSidebar);