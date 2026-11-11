<template>
  <el-result icon="warning" title="没有权限" sub-title="你的账号没有访问这个页面的权限，请联系管理员">
    <template #extra>
      <el-button type="primary" @click="$router.replace('/')">返回首页</el-button>
    </template>
  </el-result>
</template>
