<script setup lang="ts">
import { FormInst } from "naive-ui";
import type { SelectOption } from "naive-ui";
import type { VNodeChild } from "vue";
import { faker } from "@faker-js/faker";
import { Icon } from "#components";

import FALLBACK_JSON from "@/assets/json/url-doi-icons.json";
import PREFIX_JSON from "@/assets/json/prefix.json";

definePageMeta({
  layout: "collections-layout",
  middleware: ["auth"],
});

const push = usePush();
const route = useRoute();

const formRef = ref<FormInst | null>(null);

const formData = reactive<ResourceType>({
  id: route.params.resourceid as string,
  title: "",
  backlink: "",
  description: faker.commerce.productDescription(),
  icon: "",
  target: "",
  type: null,
});

const rules = {
  title: {
    message: "Please enter a title",
    required: true,
    trigger: "blur, input",
  },
  description: {
    message: "Please enter a description",
    required: true,
    trigger: "blur, input",
  },
  target: {
    message: "Please enter your identifier",
    required: true,
    trigger: "blur, input",
  },
  type: {
    message: "Please enter a type",
    required: true,
    trigger: "blur, input",
  },
};

const iconOptions = FALLBACK_JSON;
const typeOptions = PREFIX_JSON;

const removeResourceLoadingIndicator = ref(false);

const { collectionid, resourceid, workspaceid } = route.params as {
  collectionid: string;
  resourceid: string;
  workspaceid: string;
};

const { data: resource, error } = await useFetch(
  `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}`,
  {
    headers: useRequestHeaders(["cookie"]),
  }
);

if (error.value) {
  console.log(error.value);

  push.error({
    title: "Something went wrong",
    message: "We couldn't load your resource",
  });

  navigateTo(
    `/dashboard/workspaces/${workspaceid}/collections/${collectionid}`
  );
}

if (resource.value) {
  formData.title = resource.value.title || faker.commerce.productName();
  formData.description = resource.value.description || faker.lorem.paragraph();
  formData.target = resource.value.target || faker.internet.url();
  formData.type = resource.value.type || "doi";
  formData.icon = resource.value.icon;
}

const renderLabel = (option: SelectOption): VNodeChild => {
  return [
    h(
      Icon,
      { name: option.value as string, class: "mr-1", size: "20" },
      {
        default: () => null,
      }
    ),
    option.label as string,
  ];
};

const selectIcon = (value: string) => {
  const curi = typeOptions.find((prefix) => prefix.value === value);

  if (curi) {
    formData.icon = curi.icon;
  }
};

const removeResource = async () => {
  removeResourceLoadingIndicator.value = true;

  const { data, error } = await useFetch(
    `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}`,
    {
      headers: useRequestHeaders(["cookie"]),
      method: "DELETE",
    }
  );

  removeResourceLoadingIndicator.value = false;

  if (error.value) {
    console.log(error.value);

    push.error({
      title: "Something went wrong",
      message: "We couldn't delete your resource",
    });
  }

  if (data.value) {
    push.success({
      title: "Resource deleted",
      message: "Your resource has been deleted",
    });

    navigateTo(
      `/dashboard/workspaces/${workspaceid}/collections/${collectionid}`
    );
  }
};

const saveResourceData = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      console.log(formData);
      console.log("Valid");
    } else {
      console.log(errors);
      console.log("Invalid");
    }
  });
};
</script>

<template>
  <main class="h-full bg-zinc-50">
    <div class="flex h-36 items-center border-b border-gray-200 bg-white">
      <div
        class="mx-auto flex w-full max-w-screen-xl items-center justify-between px-2.5 lg:px-20"
      >
        <h1>Edit this resource</h1>

        <div class="flex items-center space-x-2">
          <n-button
            size="large"
            type="error"
            secondary
            :loading="removeResourceLoadingIndicator"
            @click="removeResource"
          >
            <template #icon>
              <Icon name="iconoir:trash" />
            </template>

            Delete Resource
          </n-button>

          <n-button size="large" color="black" @click="saveResourceData">
            <template #icon>
              <Icon name="iconoir:axes" />
            </template>

            Save Resource
          </n-button>
        </div>
      </div>
    </div>

    <div class="mx-auto w-full max-w-screen-xl px-2.5 lg:px-20">
      <div class="flex items-center justify-between space-x-4 py-10"></div>
      <n-form
        ref="formRef"
        :label-width="80"
        :model="formData"
        :rules="rules"
        size="large"
      >
        <n-form-item label="Title" path="title">
          <n-input
            v-model:value="formData.title"
            placeholder="My random resource"
            clearable
          />
        </n-form-item>

        <n-form-item label="Description" path="description">
          <n-input
            v-model:value="formData.description"
            placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisi eget nunc ultricies aliquet. Sed vitae nisi eget nunc ultricies aliquet."
            type="textarea"
            clearable
          />
        </n-form-item>

        <n-form-item path="type" label="Identifier Type">
          <div class="flex w-full flex-col">
            <n-select
              v-model:value="formData.type"
              filterable
              placeholder="DOI"
              :options="typeOptions"
              @update:value="selectIcon"
            />

            <p class="mt-2 text-sm text-slate-500">
              Select the type of identifier you are linking to.
            </p>
          </div>
        </n-form-item>

        <n-form-item path="target" label="Resource Identifier">
          <div class="flex w-full flex-col">
            <n-input
              v-model:value="formData.target"
              placeholder="placeholder"
              type="text"
              :disabled="!formData.type"
              @keydown.enter.prevent
            />

            <p class="mt-2 text-sm text-slate-500">
              Click here to see if your linked resource is available and
              resolves correctly.
            </p>
          </div>
        </n-form-item>

        <n-form-item path="icon" label="Icon">
          <n-select
            v-model:value="formData.icon"
            filterable
            :options="iconOptions"
            :render-label="renderLabel"
          />
        </n-form-item>
      </n-form>

      <pre>{{ formData }}</pre>
    </div>

    <ModalNewCollection />
  </main>
</template>
