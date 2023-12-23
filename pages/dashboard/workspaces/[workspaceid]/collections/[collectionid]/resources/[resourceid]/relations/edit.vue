<script setup lang="ts">
import type { FormInst } from "naive-ui";
import { faker } from "@faker-js/faker";
import { nanoid } from "nanoid";
import { Icon } from "#components";

import PREFIX_JSON from "@/assets/json/prefix.json";
import RELATION_TYPE_JSON from "@/assets/json/relation-type.json";
import RESOURCE_TYPE_JSON from "@/assets/json/resource-type.json";

definePageMeta({
  name: "relation:edit",
  layout: "app-layout",
  middleware: ["auth"],
});

const push = usePush();
const route = useRoute();

const collectionStore = useCollectionStore();
const resourceStore = useResourceStore();

await collectionStore.getCollection(
  route.params.workspaceid as string,
  route.params.collectionid as string
);

const currentCollection = collectionStore.collection;

const currentResource = computed(() => {
  const resource = resourceStore.resources.find(
    (res) => res.id === route.params.resourceid
  );

  if (resource) {
    return resource;
  }

  return null;
});

if (currentCollection?.version?.published) {
  navigateTo(
    `/dashboard/workspaces/${route.params.workspaceid}/collections/${route.params.collectionid}/resources/${route.params.resourceid}`
  );
}

const formRef = ref<FormInst | null>(null);

/**
 * todo: create a form to handle this
 * todo: use a card/list ui to display the relations Makes it easier to add the example text this way
 */

const moduleData = reactive<Relations>({
  external: [],
  internal: [],
});

const typeOptions = PREFIX_JSON;
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
      action: undefined,
      origin: "remote",
    };
  });
  moduleData.external = relations.value.external.map((relation) => {
    return {
      ...relation,
      action: undefined,
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
    original_id: null,
    resource_type: null,
    target_id: null,
    type: null,
    updated: new Date().toISOString(),
  });
};

const removeInternalRelation = (id: string) => {
  const internalRelation = moduleData.internal.find(
    (relation) => relation.id === id
  );

  if (internalRelation?.origin === "remote") {
    const {
      data: deleteInternalRelationData,
      error: deleteInternalRelationError,
    } = useFetch(
      `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}/relations/${id}/internal`,
      {
        headers: useRequestHeaders(["cookie"]),
        method: "DELETE",
      }
    );

    if (deleteInternalRelationError.value) {
      console.log(deleteInternalRelationError.value);

      push.error({
        title: "Something went wrong",
        message: "We couldn't delete your relation",
      });

      throw new Error("We couldn't delete your relation");
    }

    if (deleteInternalRelationData.value) {
      console.log(deleteInternalRelationData.value.message);
    }
  }

  push.success({
    title: "Success",
    message: "Your relation has been deleted",
  });

  moduleData.internal = moduleData.internal.filter(
    (relation) => relation.id !== id
  );
};

const addNewExternalRelation = () => {
  moduleData.external.push({
    id: nanoid(),
    created: new Date().toISOString(),
    origin: "local",
    original_id: null,
    resource_type: "poster",
    target: faker.internet.url(),
    target_type: "URL",
    type: "Cites",
    updated: new Date().toISOString(),
  });
};

const removeExternalRelation = (id: string) => {
  const externalRelation = moduleData.external.find(
    (relation) => relation.id === id
  );

  if (externalRelation?.origin === "remote") {
    const {
      data: deleteExternalRelationData,
      error: deleteExternalRelationError,
    } = useFetch(
      `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}/relations/${id}/external`,
      {
        headers: useRequestHeaders(["cookie"]),
        method: "DELETE",
      }
    );

    if (deleteExternalRelationError.value) {
      console.log(deleteExternalRelationError.value);

      push.error({
        title: "Something went wrong",
        message: "We couldn't delete your relation",
      });

      throw new Error("We couldn't delete your relation");
    }

    if (deleteExternalRelationData.value) {
      console.log(deleteExternalRelationData.value.message);
    }
  }

  push.success({
    title: "Success",
    message: "Your relation has been deleted",
  });

  moduleData.external = moduleData.external.filter(
    (relation) => relation.id !== id
  );
};

const saveRelations = async () => {
  const body = {
    external: moduleData.external.map((relation) => {
      const data = {
        resource_type: relation.resource_type || "",
        target: relation.target,
        target_type: relation.target_type,
        type: relation.type,
      };

      if (relation.origin === "remote") {
        return {
          ...data,
          id: relation.id,
        };
      } else {
        return data;
      }
    }),
    internal: moduleData.internal.map((relation) => {
      const data = {
        resource_type: relation.resource_type || "",
        target_id: relation.target_id,
        type: relation.type,
      };

      if (relation.origin === "remote") {
        return {
          ...data,
          id: relation.id,
        };
      } else {
        return data;
      }
    }),
  };

  saveRelationsLoadingIndicator.value = true;

  const { data: saveRelationsData, error: saveRelationsError } = await useFetch(
    `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}/relations`,
    {
      body: JSON.stringify(body),
      headers: useRequestHeaders(["cookie"]),
      method: "PUT",
    }
  );

  saveRelationsLoadingIndicator.value = false;

  if (saveRelationsError.value) {
    console.log(saveRelationsError.value.message);

    push.error({
      title: "Something went wrong",
      message: "We couldn't save your relations",
    });

    throw new Error("We couldn't save your relations");
  }

  if (saveRelationsData.value) {
    moduleData.internal = saveRelationsData.value.relations.internal.map(
      (relation) => {
        return {
          ...relation,
          action: relation.action || undefined,
          origin: "remote",
        };
      }
    );

    moduleData.external = saveRelationsData.value.relations.external.map(
      (relation) => {
        return {
          ...relation,
          action: relation.action || undefined,
          origin: "remote",
        };
      }
    );

    push.success({
      title: "Success",
      message: "Your relations have been saved. Syncing...",
    });
  }
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
            @click="saveRelations"
          >
            <template #icon>
              <Icon name="humbleicons:save" />
            </template>

            Save changes
          </n-button>
        </div>
      </div>
    </div>

    <div class="mx-auto w-full max-w-screen-xl px-2.5 lg:px-20">
      <n-form
        ref="formRef"
        :label-width="130"
        :model="moduleData"
        size="large"
        label-placement="left"
      >
        <div class="flex items-center justify-between py-10">
          <h3>Internal Relations</h3>

          <n-button color="black" @click="addNewInternalRelation">
            <template #icon>
              <Icon name="mdi:plus-network" />
            </template>

            Add a new internal relation
          </n-button>
        </div>

        <div
          v-for="relation of moduleData.internal"
          :key="relation.id"
          class="flex items-center justify-between space-x-8"
        >
          <n-form-item path="type" label="Relation Type" class="w-full">
            <n-select
              v-model:value="relation.type"
              filterable
              :options="relationTypeOptions"
            />
          </n-form-item>

          <n-form-item path="target" label="Resource" class="w-full">
            <n-select
              v-model:value="relation.target_id"
              filterable
              :disabled="!!relation.original_id"
              :loading="resourceListLoadingIndicator"
              :options="resourceList || []"
            />
          </n-form-item>

          <n-form-item
            path="resource_type"
            label="Resource Type"
            class="w-full"
          >
            <n-select
              v-model:value="relation.resource_type"
              filterable
              :options="resourceTypeOptions"
            />
          </n-form-item>

          <n-button
            type="error"
            size="large"
            @click="removeInternalRelation(relation.id)"
          >
            <template #icon>
              <Icon name="iconoir:trash" />
            </template>
          </n-button>
        </div>

        <pre>{{ moduleData.internal }}</pre>

        <n-divider />

        <div class="flex items-center justify-between py-10">
          <h2>External Relations</h2>

          <n-button color="black" @click="addNewExternalRelation">
            <template #icon>
              <Icon name="tabler:link-plus" />
            </template>

            Add a new external relation
          </n-button>
        </div>

        <n-space vertical size="large">
          <div
            v-for="relation of moduleData.external"
            :key="relation.id"
            class="flex items-center justify-between space-x-8 rounded-xl border bg-white px-3 py-5"
          >
            <div class="flex w-full flex-col">
              <div class="flex w-full items-center">
                <n-form-item path="resource_type" class="w-full">
                  <template #label>
                    <span class="font-medium">Resource Type</span>
                  </template>

                  <n-select
                    v-model:value="relation.resource_type"
                    filterable
                    :options="resourceTypeOptions"
                  />
                </n-form-item>

                <n-form-item path="type" label="Type" class="w-full">
                  <template #label>
                    <span class="font-medium">Relation Type</span>
                  </template>

                  <n-select
                    v-model:value="relation.type"
                    filterable
                    :options="relationTypeOptions"
                  />
                </n-form-item>
              </div>

              <div class="flex w-full flex-col">
                <n-form-item path="target">
                  <template #label>
                    <span class="font-medium">Target Type</span>
                  </template>

                  <n-select
                    v-model:value="relation.target_type"
                    :disabled="!!relation.original_id"
                    filterable
                    :options="typeOptions"
                  />
                </n-form-item>

                <n-form-item path="resource_type">
                  <template #label>
                    <span class="font-medium">Target</span>
                  </template>

                  <n-input
                    v-model:value="relation.target"
                    :disabled="!!relation.original_id"
                    placeholder="https://example.com"
                  />
                </n-form-item>
              </div>

              <div
                class="flex w-full items-center justify-between border-t pt-4"
              >
                <div>
                  <p
                    v-if="
                      relation.type &&
                      relation.resource_type &&
                      relation.target_type &&
                      relation.target
                    "
                    class="text-sm"
                  >
                    The
                    <code>
                      {{ currentResource?.title }}
                    </code>
                    resource
                    <code>
                      {{ relation.type }}
                    </code>
                    a
                    <code>
                      {{ relation.resource_type }}
                    </code>
                    resource identified by the
                    <code>
                      {{ relation.target_type }} {{ relation.target }}
                    </code>
                    .
                  </p>
                </div>

                <div class="flex w-max items-center">
                  <n-divider
                    v-if="
                      relation.type &&
                      relation.resource_type &&
                      relation.target_type &&
                      relation.target
                    "
                    vertical
                  />

                  <n-space class="w-max">
                    <n-tag
                      v-if="
                        !relation.original_id || relation.action === 'create'
                      "
                      type="info"
                    >
                      New
                    </n-tag>

                    <n-tag v-if="relation.origin" type="success">
                      {{ relation.origin === "remote" ? "Remote" : "Local" }}
                    </n-tag>
                  </n-space>

                  <n-divider vertical />

                  <n-button
                    type="error"
                    secondary
                    @click="removeExternalRelation(relation.id)"
                  >
                    <template #icon>
                      <Icon name="iconoir:trash" />
                    </template>

                    Remove relation
                  </n-button>
                </div>
              </div>
            </div>
          </div>
        </n-space>
      </n-form>

      <n-divider />

      <pre>{{ moduleData.external }}</pre>
    </div>

    <ModalNewCollection />
  </main>
</template>
