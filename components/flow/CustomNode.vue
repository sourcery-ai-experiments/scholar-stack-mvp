<script lang="ts" setup>
import { faker } from "@faker-js/faker";

// props were passed from the slot using `v-bind="customNodeProps"`
const props = defineProps({
  label: {
    required: true,
    type: String,
  },
});

console.log(props.label);

const col = ref(faker.color.rgb());
</script>

<template>
  <div
    class="flex h-full w-[150px] flex-col gap-3 rounded border border-solid bg-white p-4 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
    :style="{
      borderColor: col,
    }"
  >
    <span class="text-center text-sm"> {{ label }} </span>
  </div>
</template>
