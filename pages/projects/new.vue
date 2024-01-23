<script setup lang="ts">
import { useMessage } from "naive-ui";
import type { FormInst, FormItemRule } from "naive-ui";
import { faker } from "@faker-js/faker";

const message = useMessage();
const loading = ref(false);

const timestamp = Date.now();

const formRef = ref<FormInst | null>(null);

const formValue = reactive({
  title: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  image: "",
  tags: [
    faker.word.noun(),
    faker.word.noun(),
    faker.word.noun(),
    faker.word.noun(),
  ],
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
    required: true,
    trigger: ["input"],
    validator: (rule: FormItemRule, value: any) => {
      if (value.length < 1) {
        return new Error("Please enter at least one tag");
      }
    },
  },
};

const createProject = (e: MouseEvent) => {
  e.preventDefault();

  formRef.value?.validate(async (errors) => {
    if (!errors) {
      /**
       * TODO: Explore if length limits are needed
       */

      loading.value = true;

      try {
        const body = {
          name: formValue.title,
          description: formValue.description,
          image:
            formValue.image ||
            `https://api.dicebear.com/6.x/shapes/svg?seed=${encodeURIComponent(
              formValue.title,
            )}`,
          tags: formValue.tags,
        };

        const { data, error } = await useFetch("/api/projects", {
          body: JSON.stringify(body),
          headers: useRequestHeaders(["cookie"]),
          method: "POST",
        });

        if (error.value) {
          const errorMessage = error.value.data.message;
          throw new Error(errorMessage);
        }

        const response = data.value;

        if (response && "body" in response) {
          message.success("Project created successfully");

          const responseBody: APIResponseNewProject = JSON.parse(
            response.body as string,
          );

          if (responseBody && "identifier" in responseBody) {
            navigateTo(`/projects/${responseBody.identifier}`);
          }
        }
      } catch (error) {
        console.error(error);
        message.error("Something went wrong, please try again later");
      }

      loading.value = false;
    } else {
      console.log(errors);
    }
  });
};

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <main class="px-12 py-8">
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
        label-width="140px"
        :show-feedback="true"
      >
        <div class="flex w-full flex-col space-y-2 p-3">
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
              placeholder="Type and press `Enter` to create tag"
              :show-arrow="false"
              :show="false"
            />
          </n-form-item>

          <n-form-item path="image" label="Image URL">
            <div class="flex w-full flex-col">
              <n-input
                v-model:value="formValue.image"
                :placeholder="`https://api.dicebear.com/6.x/shapes/svg`"
                type="text"
                @keydown.enter.prevent
              />

              <p class="mt-1 text-sm text-slate-500">
                This image is used as the project thumbnail. If left blank, a
                random image will be generated.
              </p>
            </div>
          </n-form-item>

          <div class="flex w-full justify-start pb-10 pl-[150px]">
            <img
              class="h-full max-h-[300px] w-auto rounded-lg"
              :src="
                formValue.image ||
                `https://api.dicebear.com/6.x/shapes/svg?seed=${timestamp}`
              "
            />
          </div>
        </div>
      </n-form>

      <div class="flex items-center justify-center space-x-4">
        <n-button
          type="primary"
          size="large"
          strong
          :loading="loading"
          @click="createProject"
        >
          <template #icon>
            <Icon name="ph:plus-circle-bold" />
          </template>
          Create Project
        </n-button>
      </div>
    </div>
  </main>
</template>
