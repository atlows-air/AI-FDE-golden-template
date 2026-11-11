<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function retry() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  void router.replace(redirect)
}
</script>

<template>
  <el-result icon="error" title="服务暂时不可用" sub-title="连不上后端服务，可能还在启动中。稍等片刻再试">
    <template #extra>
      <el-button type="primary" @click="retry">重试</el-button>
    </template>
  </el-result>
</template>
