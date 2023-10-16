<script setup lang="ts">
import { FormInst } from "naive-ui";
import { useCollectionStore } from "@/stores/collection";

definePageMeta({
  layout: "collections-layout",
  middleware: ["auth"],
});

const push = usePush();
const route = useRoute();
const collectionStore = useCollectionStore();

const formRef = ref<FormInst | null>(null);

const formData = reactive({
  title: "",
  description: "",
  type: "",
  url: "",
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
  type: {
    message: "Please enter a type",
    required: true,
    trigger: "blur, input",
  },
  url: {
    message: "Please enter a url",
    required: true,
    trigger: "blur, input",
  },
};

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

const saveResourceData = () => {};
</script>

<template>
  <main class="h-full bg-zinc-50">
    <div class="flex h-36 items-center border-b border-gray-200 bg-white">
      <div
        class="mx-auto flex w-full max-w-screen-xl items-center justify-between px-2.5 lg:px-20"
      >
        <h1>Edit this resource</h1>

        <div class="flex items-center space-x-2">
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
      </n-form>
    </div>

    <ModalNewCollection />
  </main>
</template>
