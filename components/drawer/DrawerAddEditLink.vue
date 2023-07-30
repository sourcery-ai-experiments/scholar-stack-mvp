<script setup lang="ts">
import { useMessage } from "naive-ui";
import type { FormInst } from "naive-ui";
import { faker } from "@faker-js/faker";
import { nanoid } from "nanoid";

import { useLinkStore } from "@/stores/link";

const props = defineProps({
  hideAddEditLinkDrawerFunction: {
    required: true,
    type: Function,
  },
  linkIdentifier: {
    required: true,
    type: String,
  },
  projectIdentifier: {
    required: true,
    type: String,
  },
});

const message = useMessage();

const linkStore = useLinkStore();

const loading = ref(false);

const formRef = ref<FormInst | null>(null);

const formValue: LocalLinkType = reactive({
  id: nanoid(),
  name: faker.git.commitMessage(),
  description: faker.word.words({ count: { max: 100, min: 50 } }),
  target: faker.internet.url(),
  type: "doi",
});

if (props.linkIdentifier !== "new") {
  const link = linkStore.getLink(props.linkIdentifier);

  if (link) {
    formValue.id = link.id;
    formValue.name = link.name;
    formValue.description = link.description;
    formValue.target = link.target;
    formValue.type = link.type;
  }
}

const rules = {
  name: {
    message: "Please enter a title",
    required: true,
    trigger: ["input"],
  },
  description: {
    message: "Please enter a description",
    required: true,
    trigger: ["input"],
  },
  target: {
    message: "Please enter a valid URL or DOI",
    required: true,
    trigger: ["input"],
  },
  type: {
    message: "Please select a type",
    required: true,
    trigger: ["change"],
  },
};

const typeOptions = [
  {
    label: "DOI",
    value: "doi",
  },
  {
    label: "URL",
    value: "url",
  },
];

const drawerTitle = computed(() => {
  if (props.linkIdentifier === "new") {
    return "Add Resource";
  }

  return "Edit Resource";
});

const buttonDetails = computed(() => {
  if (props.linkIdentifier === "new") {
    return {
      icon: "ph:plus-circle-bold",
      text: "Add Resource",
    };
  }

  return {
    icon: "material-symbols:save",
    text: "Save Changes",
  };
});

const addResource = (e: MouseEvent) => {
  e.preventDefault();

  formRef.value?.validate((errors) => {
    if (!errors) {
      loading.value = true;

      const link: LocalLinkType = {
        id: nanoid(),
        name: formValue.name,
        description: formValue.description,
        target: formValue.target,
        type: formValue.type,
      };

      linkStore.addLink(link);

      message.success("Resource added successfully");

      props.hideAddEditLinkDrawerFunction();

      loading.value = false;
    } else {
      console.log(errors);
    }
  });
};
</script>

<template>
  <n-drawer-content :title="drawerTitle">
    <n-form
      ref="formRef"
      :model="formValue"
      :rules="rules"
      size="large"
      label-placement="top"
      :show-feedback="true"
    >
      <div class="flex w-full flex-col space-y-2 p-3">
        <n-form-item path="name" label="Name of resource">
          <n-input
            v-model:value="formValue.name"
            placeholder="Primary data for the paper: MicroCT imaging of the human cervical vagus nerve"
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

        <n-form-item path="type" label="Type of resource">
          <n-select
            v-model:value="formValue.type"
            filterable
            placeholder="DOI"
            :options="typeOptions"
          />
        </n-form-item>

        <n-form-item path="target" label="Resource URL/DOI">
          <div class="flex w-full flex-col">
            <n-input
              v-model:value="formValue.target"
              :placeholder="`https://doi.org/10.1101/2021.05.07.443555`"
              type="text"
              @keydown.enter.prevent
            />

            <p class="mt-1 text-sm text-slate-500">
              DOI's should be in the format of a URL, e.g.
              https://doi.org/10.1101/2021.05.07.443555
            </p>
          </div>
        </n-form-item>
      </div>
    </n-form>

    <div class="flex items-center justify-center space-x-4">
      <n-button
        type="primary"
        size="large"
        strong
        :loading="loading"
        @click="addResource"
      >
        <template #icon>
          <Icon :name="buttonDetails.icon" />
        </template>
        {{ buttonDetails.text }}
      </n-button>
    </div>
  </n-drawer-content>
</template>
