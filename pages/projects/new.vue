<template>
  <main class="px-8 py-16">
    <h1>Lets create a new project</h1>

    <p class="mt-2 text-lg text-slate-600">
      We need some information about your project to get started.
    </p>

    <n-divider />

    <div class="my-8">
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        size="large"
        label-placement="left"
        label-width="120px"
        :show-feedback="true"
      >
        <div class="flex flex-row items-end space-x-10">
          <div class="flex w-full flex-col space-y-10 p-3">
            <n-form-item path="title" label="Title">
              <n-input
                v-model:value="formValue.title"
                placeholder="Human cervical vagus nerve fascicle imaging with MicroCT"
                @keydown.enter.prevent
              />
            </n-form-item>

            <n-form-item path="description" label="Description">
              <n-input
                v-model:value="formValue.description"
                placeholder="MicroCT imaging of the human cervical vagus nerve: slices at 0.5 cm spacing are provided across a 5 cm window representing the surgical window typical of vagus nerve stimulation. Derived data include fascicle morphometry, splitting and merging events."
                type="textarea"
                @keydown.enter.prevent
              />
            </n-form-item>

            <n-form-item path="tags" label="Tags">
              <n-select
                v-model:value="formValue.tags"
                filterable
                multiple
                tag
                placeholder="Input, press enter to create tag"
                :show-arrow="false"
                :show="false"
              />
            </n-form-item>

            <n-form-item path="image" label="Image">
              <div class="flex w-full flex-col">
                <n-input
                  v-model:value="formValue.image"
                  :placeholder="`https://api.dicebear.com/6.x/shapes/svg`"
                  type="text"
                  @keydown.enter.prevent
                />
                <p class="mt-1 text-sm text-slate-500">
                  To save on storage space we use URL's to images hosted on the
                  internet.
                </p>
              </div>
            </n-form-item>
          </div>

          <div class="w-fit pb-10">
            <img
              class="h-full max-h-[300px] w-full rounded-lg"
              :src="
                formValue.image ||
                `https://api.dicebear.com/6.x/shapes/svg?seed=${timestamp}`
              "
            />
          </div>
        </div>
      </n-form>

      <div class="flex justify-center">
        <n-button type="primary" size="large" :loading="loading">
          Create Project
        </n-button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { FormInst } from "naive-ui";
import { useMessage } from "naive-ui";
const user = useSupabaseUser();

const message = useMessage();
const loading = ref(false);

const timestamp = Date.now();

const formRef = ref<FormInst | null>(null);

const formValue = reactive({
  title: "",
  description: "",
  image: "",
  tags: [],
});

const rules = {
  title: {
    message: "Please enter a title",
    required: true,
    trigger: ["input"],
  },
  description: {
    message: "Please enter a description",
    required: true,
    trigger: ["input"],
  },
  tags: {
    message: "Please enter at least one tag",
    required: true,
    trigger: ["input"],
  },
};

definePageMeta({
  middleware: ["auth"],
});
</script>
