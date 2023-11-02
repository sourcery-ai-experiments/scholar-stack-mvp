<script setup lang="ts">
import type { FormInst, FormItemRule, SelectOption } from "naive-ui";

import type { VNodeChild } from "vue";
import { faker } from "@faker-js/faker";
import { Icon } from "#components";

import RELATION_TYPE_JSON from "@/assets/json/relation-type.json";

definePageMeta({
  layout: "collections-layout",
  middleware: ["auth"],
});

const push = usePush();
const route = useRoute();

const formRef = ref<FormInst | null>(null);

const moduleData = reactive<Relations>({
  internal: [],
  external: [],
});

const relationTypeOptions = RELATION_TYPE_JSON;

const saveRelationsLoadingIndicator = ref(false);

const { collectionid, resourceid, workspaceid } = route.params as {
  collectionid: string;
  resourceid: string;
  workspaceid: string;
};

const { data: relations, error } = await useFetch(
  `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}/relations`,
  {
    headers: useRequestHeaders(["cookie"]),
  }
);

if (error.value) {
  console.log(error.value);

  push.error({
    title: "Something went wrong",
    message: "We couldn't load your relations",
  });

  navigateTo(
    `/dashboard/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}`
  );
}

if (relations.value) {
  moduleData.internal = relations.value.internal;
  moduleData.external = relations.value.external;
}

// const addRelation = async () => {
//   const { data, error } = await useFetch(
//     `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}/relation`,
//     {
//       headers: useRequestHeaders(["cookie"]),
//       method: "POST",
//     }
//   );

//   if (error.value) {
//     console.log(error.value);

//     push.error({
//       title: "Something went wrong",
//       message: "We couldn't create a new relation",
//     });

//     throw new Error("Something went wrong");
//   }

//   if (data.value) {
//     if (!resource.value!.Relation) {
//       resource.value!.Relation = [];
//     }

//     resource.value!.Relation.push({
//       id: data.value.id,
//       created: new Date().toISOString(),
//       source: resource.value!.id,
//       target: "",
//       target_type: "",
//       type: "",
//       updated: new Date().toISOString(),
//     });
//   }
// };

// const removeRelation = (id: string) => {
//   console.log("remove relation", id);
// };
</script>

<template>
  <main class="h-full bg-zinc-50">
    <div class="flex h-36 items-center border-b border-gray-200 bg-white">
      <div
        class="mx-auto flex w-full max-w-screen-xl items-center justify-between px-2.5 lg:px-20"
      >
        <h1>Edit relations</h1>

        <div class="flex items-center space-x-2">
          <n-button
            size="large"
            color="black"
            :loading="saveRelationsLoadingIndicator"
          >
            <template #icon>
              <Icon name="iconoir:axes" />
            </template>

            Save changes
          </n-button>
        </div>
      </div>
    </div>

    <div class="mx-auto w-full max-w-screen-xl px-2.5 lg:px-20">
      <div class="flex items-center justify-between">
        <h2 class="pb-10 pt-16">Internal Relations</h2>

        <n-button color="black" :loading="saveRelationsLoadingIndicator">
          <template #icon>
            <Icon name="carbon:add-filled" />
          </template>

          Add a new internal relation | use post type saving like fairhub does |
          one form for all relations
        </n-button>
      </div>

      <n-form
        ref="formRef"
        :label-width="80"
        :model="moduleData.internal"
        size="large"
      >
        <div v-for="relation of moduleData.internal" :key="relation.id">
          <n-form-item path="type" label="Type">
            <n-select
              v-model:value="relation.type"
              filterable
              :options="relationTypeOptions"
            />
          </n-form-item>
        </div>

        <!-- <n-form-item path="icon" label="Icon">
          <n-select
            v-model:value="internalFormData.icon"
            filterable
            :options="iconOptions"
            :render-label="renderLabel"
          />
        </n-form-item> -->
      </n-form>

      <n-divider />

      <pre>{{ moduleData.internal }}</pre>

      <h2 class="pb-10 pt-16">External Relations</h2>

      <n-form
        ref="formRef"
        :label-width="80"
        :model="moduleData.external"
        size="large"
      >
        <!-- <n-form-item path="icon" label="Icon">
          <n-select
            v-model:value="internalFormData.icon"
            filterable
            :options="iconOptions"
            :render-label="renderLabel"
          />
        </n-form-item> -->
      </n-form>

      <n-divider />

      <pre>{{ moduleData.external }}</pre>
    </div>

    <ModalNewCollection />
  </main>
</template>
