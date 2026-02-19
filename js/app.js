/* ============================================
   FEAST TOGETHER - Main App Logic
   Handles navigation, scroll animations, global init
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // === Mobile Navigation Toggle ===
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // === Update Auth Navigation ===
  Auth.updateNav();

  // === Scroll-triggered Animations (IntersectionObserver) ===
  const animatedElements = document.querySelectorAll('.animate-on-scroll, .feature-card, .fade-in-up');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // stop watching once visible
        }
      });
    }, { threshold: 0.15 });

    // Delay observer setup so browser paints the hidden state first
    requestAnimationFrame(() => {
      animatedElements.forEach(el => observer.observe(el));
    });
  } else {
    // Fallback for very old browsers
    animatedElements.forEach(el => el.classList.add('visible'));
  }

  // === Navbar Scroll Effect ===
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
      } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
      }
    });
  }

  // === Close Modals on Overlay Click ===
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // === Keyboard Escape to Close Modals ===
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  });

  // === Enter Key for Search Input ===
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchRecipes();
      }
    });
  }
});
