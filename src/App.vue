<template>
  <div class="app-root">
    <!-- Portal internal: tidak ditautkan dari website, dibuka lewat /#portal -->
    <CompliancePortal
      v-if="isPortalOpen"
      @exit="closePortal"
    />

    <template v-else>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <PortfolioSection />
        <ContactSection />
      </main>
      <FooterSection />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import Navbar from './components/Navbar.vue';
import HeroSection from './components/HeroSection.vue';
import AboutSection from './components/AboutSection.vue';
import ServicesSection from './components/ServicesSection.vue';
import PortfolioSection from './components/PortfolioSection.vue';
import ContactSection from './components/ContactSection.vue';
import FooterSection from './components/FooterSection.vue';

// Dimuat terpisah: pengunjung website tidak ikut mengunduh kode portal dan Firebase
const CompliancePortal = defineAsyncComponent(() => import('./components/portal/CompliancePortal.vue'));

const isPortalOpen = ref(false);

const closePortal = () => {
  isPortalOpen.value = false;
  if (window.location.hash === '#portal') {
    history.replaceState(null, '', window.location.pathname);
  }
};

const checkHash = () => {
  if (window.location.hash === '#portal') {
    isPortalOpen.value = true;
  }
};

onMounted(() => {
  checkHash();
  window.addEventListener('hashchange', checkHash);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', checkHash);
});
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

main {
  flex-grow: 1;
}
</style>
