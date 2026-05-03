<template>
  <template v-if="!isAdminRoute">
    <Navbar />
  </template>
  <RouterView :key="route.fullPath" />
  <template v-if="!isAdminRoute">
    <AppFooter />
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>

