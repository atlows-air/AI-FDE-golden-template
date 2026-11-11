<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="page-card">
    <h2>你好，{{ auth.user?.nickname }}</h2>
    <p>这是 Demo 的首页。搭建时把它换成这个 Demo 的入口页面或数据概览。</p>
  </div>
</template>
