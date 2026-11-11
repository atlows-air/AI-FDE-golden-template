<template>
  <el-result icon="info" title="页面不存在" sub-title="地址可能写错了，或者页面已经下线">
    <template #extra>
      <el-button type="primary" @click="$router.replace('/')">返回首页</el-button>
    </template>
  </el-result>
</template>
