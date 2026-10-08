<script setup lang="ts">
import type { DataSource } from '#shared/krl'

defineProps<{ source?: DataSource }>()
</script>

<template>
  <p v-if="source === 'simulasi'" class="note">
    <strong>Jadwal simulasi.</strong> API KRL belum dikonfigurasi di server, jadi waktu di bawah bukan jadwal resmi.
  </p>
</template>

<style scoped>
.note {
  margin: 0 0 1.5rem;
  padding: 0.6rem 0.95rem;
  font-size: 0.9375rem;
  color: var(--text);
  background: var(--soon-bg);
  border-radius: 10px;
}
.note strong { color: var(--soon); font-weight: 600; }
</style>
