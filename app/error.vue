<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
useHead({ title: props.error.statusCode === 404 ? 'Tidak ditemukan' : 'Terjadi kesalahan' })
</script>

<template>
  <div class="shell">
    <AppHeader />
    <main class="container main error">
      <h1>{{ error.statusCode === 404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan' }}</h1>
      <p class="muted">{{ error.statusMessage || error.message }} <span class="num">({{ error.statusCode }})</span></p>
      <button class="btn" @click="clearError({ redirect: '/' })">Ke beranda</button>
    </main>
  </div>
</template>

<style scoped>
.error { padding-top: 4rem; text-align: center; }
.error h1 { margin: 0.25rem 0 0.5rem; }
.error .btn { margin-top: 1.5rem; }
</style>
