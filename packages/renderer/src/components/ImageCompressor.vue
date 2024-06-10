<template>
  <div class="image-compressor">
    <Button
      type="primary"
      @click="start"
    >
      选择目录
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button, Message } from "@arco-design/web-vue";

import { selectDirAndCompressImages } from "#preload";

async function start() {
  await selectDirAndCompressImages();
  Message.success("压缩完成");
}
</script>

<style scoped></style>
