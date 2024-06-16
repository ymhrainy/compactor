<template>
  <div class="image-compressor">
    <div class="compress-task-source">
      <div class="compress-task-source-selector">
        <Button
          type="primary"
          @click="chooseSourceAndCompress('dir')"
        >
          选择文件夹
        </Button>
      </div>

      <div class="compress-task-source-selector">
        <Button
          type="primary"
          @click="chooseSourceAndCompress('files')"
        >
          选择文件
        </Button>
      </div>
    </div>

    <div class="compress-task-options">
      <ASlider
        v-model="quality"
        :format-tooltip="qualityFormatter"
      />
    </div>

    <div class="compress-task">
      <div class="compress-task-preview">
        <CompressTaskPreview :files="compressTaskFiles"></CompressTaskPreview>
      </div>
      <div
        v-show="hasFiles"
        class="compress-task-summary"
      >
        共{{ compressTaskFiles.length }}张图片
      </div>
    </div>

    <div class="compress-task-commands">
      <Button
        type="primary"
        :disabled="!hasFiles"
        :style="{ width: '100%' }"
        @click="confirmTask"
      >
        开&nbsp;始
      </Button>
    </div>

    <div class="compress-task-progress">
      <Progress
        v-show="hasFiles"
        :percent="progress"
        :show-text="false"
      ></Progress>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRaw } from "vue";
import { Button, Message, Progress } from "@arco-design/web-vue";

import {
  waitForUserToChooseSource,
  prepareCompressTaskFromSource,
  confirmCompressImages,
} from "#preload";
import type {
  CompressTaskFile,
  CompressTaskSource,
  CompressTaskSourceType,
  OnProgress,
} from "@shared/types";

import CompressTaskPreview from "./CompressTaskPreview.vue";

const onProgress: OnProgress = ({ progress: pro }) => {
  progress.value = pro;
};
const quality = ref(85);
const qualityFormatter = (value: number) => {
  return `图片质量: ${value}`;
};

const progress = ref(0);

let compressTaskSource: CompressTaskSource | null = null;
const compressTaskFiles = ref<CompressTaskFile[]>([]);

const hasFiles = computed(() => compressTaskFiles.value.length > 0);

async function confirmTask() {
  if (!compressTaskSource) throw new Error("Lacks task source");
  await confirmCompressImages(compressTaskSource, toRaw(compressTaskFiles.value), onProgress);
  Message.success("压缩完成");
}

function resetTask() {
  progress.value = 0;
  compressTaskFiles.value = [];
  compressTaskSource = null;
}

async function chooseSourceAndCompress(sourceType: CompressTaskSourceType) {
  resetTask();
  const source = await waitForUserToChooseSource(sourceType);
  const compressFiles = await prepareCompressTaskFromSource(source, quality.value);
  if (compressFiles.length > 0) {
    compressTaskSource = source;
    compressTaskFiles.value = compressFiles;
  }
}
</script>

<style scoped lang="scss">
.image-compressor {
  width: 100%;
  height: 100%;
  padding: 1em;
  position: relative;
  display: flex;
  flex-direction: column;
  .compress-task-source {
    display: flex;
    justify-content: space-around;
    border: 1px dashed gray;
    .compress-task-source-selector {
      padding: 1em;
    }
  }
  .compress-task-options {
    margin: 1em 0;
  }
  .compress-task {
    margin: 0.5em 0;
    border: 1px solid lightgray;
    padding: 1em;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .compress-task-preview {
      flex: 1;
      overflow: auto;
    }
    .compress-task-summary {
      transform: translateY(0.5em);
    }
  }

  .compress-task-commands {
    margin: 1em 0;
  }

  .compress-task-progress {
    width: 100%;
    height: 1em;
  }
}
</style>
