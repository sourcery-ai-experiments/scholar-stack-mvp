<script lang="ts" setup>
import { faker } from "@faker-js/faker";
// props were passed from the slot using `v-bind="customNodeProps"`
const props = defineProps({
  id: {
    required: true,
    type: String,
  },
  label: {
    required: true,
    type: String,
  },
});

const localLabel = ref(props.label);
const loading = ref(false);

const route = useRoute();
const { identifier } = route.params as { identifier: string };

onMounted(async () => {
  if (!props.label) {
    loading.value = true;

    await $fetch(`/api/discover/collections/${identifier}/${props.id}`)
      .then((data) => {
        localLabel.value = data.title;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        loading.value = false;
      });
  }
});

const col = ref(faker.color.rgb());
</script>

<template>
  <div
    class="flex h-full max-w-[200px] flex-col gap-3 rounded border border-solid bg-white p-4 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
    :style="{
      borderColor: col,
    }"
  >
    <n-spin :show="loading">
      <span class="text-center text-sm"> {{ localLabel }} </span>
    </n-spin>
  </div>
</template>
