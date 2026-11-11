<template>
  <header class="navbar" :class="{ 'scrolled': isScrolled }">
    <div class="container nav-container">
      <a href="#" class="brand-link" :aria-label="`PT. Slaza Technology Mandiri, ${t.nav.home}`">
        <Logo />
      </a>

      <!-- Desktop Navigation -->
      <nav class="nav-links" :aria-label="t.nav.mainLabel">
        <a v-for="id in sections" :key="id" :href="`#${id}`" class="nav-link">{{ t.nav[id] }}</a>
      </nav>

      <!-- Actions: Language Switcher + Consultation CTA -->
      <div class="nav-actions">
        <!-- Language Switcher -->
        <div class="lang-switch" role="group" :aria-label="t.nav.langLabel">
          <button
            type="button"
            class="lang-btn"
            :class="{ 'active': locale === 'id' }"
            :aria-pressed="locale === 'id'"
            @click="setLocale('id')"
            aria-label="Bahasa Indonesia"
          >
            ID
          </button>
          <span class="lang-divider" aria-hidden="true">/</span>
          <button
            type="button"
            class="lang-btn"
            :class="{ 'active': locale === 'en' }"
            :aria-pressed="locale === 'en'"
            @click="setLocale('en')"
            aria-label="English"
          >
            EN
          </button>
        </div>

        <!-- Consultation Button -->
        <a href="#contact" class="btn btn-primary btn-sm nav-cta">
          <span>{{ t.nav.consultation }}</span>
        </a>

        <!-- Mobile Menu Toggle -->
        <button
          type="button"
          class="mobile-toggle"
          :class="{ 'open': mobileMenuOpen }"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobile-drawer"
          @click="toggleMobileMenu"
          :aria-label="t.nav.menuLabel"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <div
      id="mobile-drawer"
      class="mobile-drawer"
      :class="{ 'active': mobileMenuOpen }"
    >
      <nav class="mobile-links" :aria-label="t.nav.mobileLabel">
        <a href="#contact" class="btn btn-primary mobile-cta" @click="closeMobileMenu">
          {{ t.nav.consultation }}
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Logo from './Logo.vue';
import { useI18n } from '../composables/useI18n';
import { sections } from '../data/translations';

const { t, locale, setLocale } = useI18n();
const isScrolled = ref(false);
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 15;
};

const handleKeyDown = (event) => {
  if (event.key === 'Escape' && mobileMenuOpen.value) {
    closeMobileMenu();
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  z-index: 1000;
  background-color: #ffffff;
  border-bottom: 1px solid var(--card-border);
  transition: all var(--transition-smooth);
}

.navbar.scrolled {
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.brand-link {
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 36px;
}

.nav-link {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: var(--accent-primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Language Switcher */
.lang-switch {
  display: inline-flex;
  align-items: center;
}

.lang-btn {
  min-width: 44px;
  min-height: 44px;
  background: transparent;
  border: none;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.lang-btn.active {
  color: var(--accent-primary);
  font-weight: 800;
}

.lang-btn:hover:not(.active) {
  color: var(--text-primary);
}

.lang-divider {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.nav-cta {
  font-size: 0.88rem;
  padding: 8px 18px;
}

/* Mobile Toggle */
.mobile-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px 8px;
}

.mobile-toggle span {
  width: 100%;
  height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: all 0.25s ease;
}

.mobile-toggle.open span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}
.mobile-toggle.open span:nth-child(2) {
  opacity: 0;
}
.mobile-toggle.open span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* Mobile Drawer */
.mobile-drawer {
  display: none;
  position: absolute;
  top: var(--header-height);
  left: 0;
  right: 0;
  background: #ffffff;
  border-bottom: 1px solid var(--card-border);
  padding: 24px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(-100%);
  opacity: 0;
  /* hidden, not just transparent: closed links must not take keyboard focus */
  visibility: hidden;
  transition: transform 0.25s ease, opacity 0.25s ease, visibility 0.25s;
}

.mobile-drawer.active {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.mobile-links {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-link {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  padding: 8px 0;
  border-bottom: 1px solid var(--bg-tertiary);
}

.mobile-cta {
  margin-top: 12px;
  width: 100%;
}

@media (max-width: 900px) {
  .nav-links, .nav-cta {
    display: none;
  }
  .nav-actions {
    gap: 4px;
  }
  .mobile-toggle {
    display: flex;
  }
  .mobile-drawer {
    display: block;
  }
}
</style>
