document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initNav();
    initScrollReveal();
    initSlider();
    initScrollToTop();
})

function initLoader() {
    const fill = document.getElementById('loaderFill');
    const loader = document.getElementById('loader');
    const texts = ['Curating your experience...', 'Loading collections...', 'Almost ready...'];
    let prog = 0, t = 0;

    const interval = setInterval(() => {
        prog += Math.random() * 18;
        if (prog > 100) prog = 100;
        fill.style.width = prog + '%';
        if (t < texts.length && prog > t * 35) {
            document.getElementById('loaderText').textContent = texts[t++];
        }
        if (prog >= 100) {
            clearInterval(interval);
            setTimeout(() => loader.classList.add('hidden'), 400);
        }
    }, 80);
}

/* NAV */
function initNav() {
    window.addEventListener('scroll', () => {
        document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            mobileMenuToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                mobileMenuToggle.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mobileMenu.classList.remove('open');
                mobileMenuToggle.classList.remove('active');
            }
        });
    }
}

// Scroll Reveal

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } });

        document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    });
}

function initSlider() {
    const slider = document.getElementById('heroSlider');
    if (!slider) return;

    const track = slider.querySelector('.slider-track');
    const slides = Array.from(slider.querySelectorAll('.slide'));
    const prev = slider.querySelector('.slider-control.prev');
    const next = slider.querySelector('.slider-control.next');
    const dots = slider.querySelector('.slider-dots');
    let current = 0;
    let autoplay;

    const update = (index) => {
        current = (index + slides.length) % slides.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        slides.forEach((slide, idx) => slide.classList.toggle('active', idx === current));
        dots.querySelectorAll('button').forEach((button, idx) => {
            button.classList.toggle('active', idx === current);
        });
    };

    slides.forEach((slide, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.addEventListener('click', () => update(idx));
        dots.appendChild(dot);
    });

    prev.addEventListener('click', () => update(current - 1));
    next.addEventListener('click', () => update(current + 1));

    const startAutoplay = () => {
        clearInterval(autoplay);
        autoplay = setInterval(() => update(current + 1), 6500);
    };

    slider.addEventListener('mouseenter', () => clearInterval(autoplay));
    slider.addEventListener('mouseleave', startAutoplay);

    update(0);
    startAutoplay();
}

function initScrollToTop() {
    const button = document.getElementById('scrollToTop');
    if (!button) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });

    // Smooth scroll to top on click
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// SEARCH 
function initSearchOverlay() {
    const input = document.getElementById('searchInput');
    let debounce;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => performSearch(input.value.trim()), 300);
    });
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && input.value.trim()) {
            shopState.search = input.value.trim();
            shopState.category = null;
            shopState.page = 1;
            toggleSearch();
            showPage('shop');
        }
        if (e.key === 'Escape') toggleSearch();
    });
}

async function performSearch(q) {
    if (!q) { document.getElementById('searchResults').innerHTML = ''; return; }
    const data = await api.get(`/products?search=${encodeURIComponent(q)}&limit=5`);
    const products = data.products || [];
    const el = document.getElementById('searchResults');

    if (!products.length) {
        el.innerHTML = '<div style="color:var(--text-3);padding:16px;font-size:14px;">No results found</div>';
        return;
    }
    el.innerHTML = products.map(p => {
        `
            <div class="search-result-item" onclick="toggleSearch();viewProduct(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                <img src="${p.image_url}" alt="${p.name}" />
                <div class="search-result-info">
                    <strong>${p.name}</strong>
                    <span>$${parseFloat(p.price).toFixed(2)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function toggleSearch() {
    const overlay = document.getElementById('searchOverlay');
    overlay.classList.toggle('open');
    if (overlay.classList.contains('open')) {
        setTimeout(() => document.getElementById('searchInput').focus(), 100);
    } else {
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
    }
}

// USER PROFILE
function toggleUserProfile() {
    const drawer = document.getElementById('userDrawer');
    const overlay = document.getElementById('userOverlay');
    if (drawer && overlay) {
        drawer.classList.toggle('open');
        overlay.classList.toggle('open');

        // Close cart drawer if open
        const cartDrawer = document.getElementById('cartDrawer');
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartDrawer && cartDrawer.classList.contains('open')) {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
        }
    }
}