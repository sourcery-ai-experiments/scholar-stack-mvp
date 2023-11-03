<script setup lang="ts">
import type { FormInst } from "naive-ui";

import { nanoid } from "nanoid";
import { Icon } from "#components";

import RELATION_TYPE_JSON from "@/assets/json/relation-type.json";
import RESOURCE_TYPE_JSON from "@/assets/json/resource-type.json";

definePageMeta({
  layout: "collections-layout",
  middleware: ["auth"],
});

const push = usePush();
const route = useRoute();

const formRef = ref<FormInst | null>(null);

const moduleData = reactive<Relations>({
  external: [],
  internal: [],
});

const relationTypeOptions = RELATION_TYPE_JSON;
const resourceTypeOptions = RESOURCE_TYPE_JSON;

const saveRelationsLoadingIndicator = ref(false);

const { collectionid, resourceid, workspaceid } = route.params as {
  collectionid: string;
  resourceid: string;
  workspaceid: string;
};

const { data: relations, error: relationsError } = await useFetch(
  `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}/relations`,
  {
    headers: useRequestHeaders(["cookie"]),
  }
);

if (relationsError.value) {
  console.log(relationsError.value);

  push.error({
    title: "Something went wrong",
    message: "We couldn't load your relations",
  });

  navigateTo(
    `/dashboard/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}`
  );
}

if (relations.value) {
  moduleData.internal = relations.value.internal.map((relation) => {
    return {
      ...relation,
      origin: "remote",
    };
  });
  moduleData.external = relations.value.external.map((relation) => {
    return {
      ...relation,
      origin: "remote",
    };
  });
}

const {
  data: resourceList,
  error: resourceListError,
  pending: resourceListLoadingIndicator,
} = useLazyFetch(
  `/api/workspaces/${workspaceid}/collections/${collectionid}/resources`,
  {
    headers: useRequestHeaders(["cookie"]),
  }
);

// TODO: might need to make this into a watch statement
if (resourceListError.value) {
  console.log(resourceListError.value);

  push.error({
    title: "Something went wrong",
    message: "We couldn't load your resources",
  });
}

const addNewInternalRelation = () => {
  moduleData.internal.push({
    id: nanoid(),
    created: new Date().toISOString(),
    origin: "local",
    resource_type: null,
    source_id: resourceid,
    target_id: null,
    type: null,
    updated: new Date().toISOString(),
  });
};
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

        <n-button color="black" @click="addNewInternalRelation">
          <template #icon>
            <Icon name="carbon:add-filled" />
          </template>

          Add a new internal relation
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

          <n-form-item path="target" label="Target">
            <n-select
              v-model:value="relation.target_id"
              filterable
              :loading="resourceListLoadingIndicator"
              :options="resourceList || []"
            />
          </n-form-item>

          <n-form-item path="resource_type" label="Resource Type">
            <n-select
              v-model:value="relation.resource_type"
              filterable
              :options="resourceTypeOptions"
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
