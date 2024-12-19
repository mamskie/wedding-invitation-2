import { storage } from './storage.js';

export const theme = (() => {

    const THEME_LIGHT = 'light';
    const THEME_DARK = 'dark';
    const themeColors = {
        '#000000': '#ffffff',
        '#ffffff': '#000000',
        '#212529': '#f8f9fa',
        '#f8f9fa': '#212529'
    };
    const themeLight = ['#ffffff', '#f8f9fa'];
    const themeDark = ['#000000', '#212529'];

    let theme = null;
    let isAuto = false;
    let metaTheme = null;
    let observerLight = null;
    let observerDark = null;

    const toLight = (element) => {
        if (element.classList.contains('text-light')) {
            element.classList.remove('text-light');
            element.classList.add('text-dark');
        }

        if (element.classList.contains('btn-theme-light')) {
            element.classList.remove('btn-theme-light');
            element.classList.add('btn-theme-dark');
        }

        if (element.classList.contains('bg-dark')) {
            element.classList.remove('bg-dark');
            element.classList.add('bg-light');
        }

        if (element.classList.contains('bg-black')) {
            element.classList.remove('bg-black');
            element.classList.add('bg-white');
        }

        if (element.classList.contains('bg-theme-dark')) {
            element.classList.remove('bg-theme-dark');
            element.classList.add('bg-theme-light');
        }

        if (element.classList.contains('color-theme-black')) {
            element.classList.remove('color-theme-black');
            element.classList.add('color-theme-white');
        }

        if (element.classList.contains('btn-outline-light')) {
            element.classList.remove('btn-outline-light');
            element.classList.add('btn-outline-dark');
        }

        if (element.classList.contains('bg-cover-black')) {
            element.classList.remove('bg-cover-black');
            element.classList.add('bg-cover-white');
        }
    };

    const toDark = (element) => {
        // No-op for dark theme to prevent dark theme from being applied
    };

    const onLight = () => {
        theme.set('active', THEME_LIGHT);
        document.documentElement.setAttribute('data-bs-theme', THEME_LIGHT);

        const elements = document.querySelectorAll('.text-light, .btn-theme-light, .bg-dark, .bg-black, .bg-theme-dark, .color-theme-black, .btn-outline-light, .bg-cover-black');
        elements.forEach((e) => observerLight.observe(e));
    };

    const onDark = () => {
        // Prevent dark mode activation
        // You can keep this function empty or log something if needed.
    };

    const isDarkMode = (onDark = null, onLight = null) => {
        // Always return light mode status
        const status = theme.get('active') === THEME_LIGHT;

        if (onDark && onLight) {
            return status ? onLight : onDark;
        }

        return status;
    };

    const change = () => {
        onLight(); // Force to light mode only
    };

    const showButtonChangeTheme = () => {
        if (isAuto) {
            document.getElementById('button-theme').style.display = 'block';
        }
    };

    const spyTop = () => {
        const observerTop = new IntersectionObserver((es) => {
            es.filter((e) => e.isIntersecting).forEach((e) => {
                const themeColor = ['bg-black', 'bg-white'].some((i) => e.target.classList.contains(i))
                    ? isDarkMode(themeDark[0], themeLight[0])
                    : isDarkMode(themeDark[1], themeLight[1]);

                metaTheme.setAttribute('content', themeColor);
            });
        }, {
            rootMargin: '0% 0% -95% 0%',
        });

        document.querySelectorAll('section').forEach((e) => observerTop.observe(e));
    };

    const init = () => {
        theme = storage('theme');
        metaTheme = document.querySelector('meta[name="theme-color"]');

        observerLight = new IntersectionObserver((es, o) => {

            es.filter((e) => e.isIntersecting).forEach((e) => toLight(e.target));
            es.filter((e) => !e.isIntersecting).forEach((e) => toLight(e.target));

            o.disconnect();

            const now = metaTheme.getAttribute('content');
            metaTheme.setAttribute('content', themeDark.some((i) => i === now) ? themeColors[now] : now);
        });

        observerDark = new IntersectionObserver((es, o) => {

            es.filter((e) => e.isIntersecting).forEach((e) => toDark(e.target));
            es.filter((e) => !e.isIntersecting).forEach((e) => toDark(e.target));

            o.disconnect();

            const now = metaTheme.getAttribute('content');
            metaTheme.setAttribute('content', themeLight.some((i) => i === now) ? themeColors[now] : now);
        });

        if (!theme.has('active')) {
            theme.set('active', THEME_LIGHT); // Always set the active theme to light
        }

        switch (document.body.getAttribute('data-theme')) {
            case 'dark':
                theme.set('active', THEME_LIGHT); // Force light theme
                break;
            case 'light':
                theme.set('active', THEME_LIGHT); // Force light theme
                break;
            default:
                isAuto = true;
                break;
        }

        // Force light theme
        onLight();

        const toggle = document.getElementById('darkMode');
        if (toggle) {
            toggle.checked = false; // Ensure dark mode toggle is off

            if (!isAuto) {
                toggle.parentElement.remove();
            }
        }
    };

    return {
        change,
        init,
        spyTop,
        isDarkMode,
        showButtonChangeTheme
    };
})();
