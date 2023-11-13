<script setup lang="ts">
import type { FormInst, FormItemRule, SelectOption } from "naive-ui";

import type { VNodeChild } from "vue";
import { faker } from "@faker-js/faker";
import { Icon } from "#components";

import FALLBACK_JSON from "@/assets/json/url-doi-icons.json";
import PREFIX_JSON from "@/assets/json/prefix.json";
// import RELATION_TYPE_JSON from "@/assets/json/relation-type.json";

definePageMeta({
  layout: "collections-layout",
  middleware: ["auth"],
});

/**
 * TODO: split this into three pages
 * 1. overview with the root url
 * 2. edit page with the form
 * 3. relation page with the relations (too complex for one page alone)
 */

const push = usePush();
const route = useRoute();

const formRef = ref<FormInst | null>(null);

const formData = reactive<ResourceType>({
  id: route.params.resourceid as string,
  title: faker.commerce.productName(),
  back_link_id: "",
  description: "",
  icon: "",
  target: "",
  type: null,
});

const rules = {
  title: {
    message: "Please enter a title",
    required: true,
    trigger: ["blur", "input"],
  },
  description: {
    message: "Please enter a description",
    required: true,
    trigger: ["blur", "input"],
  },
  target: {
    // message: "Please enter your identifier",
    required: true,
    trigger: ["blur", "input"],
    validator(rule: FormItemRule, value: string) {
      if (!value) {
        return new Error("Please enter your identifier");
      }

      console.log(value, selectedIdentifier.value?.pattern);

      if (selectedIdentifier.value && selectedIdentifier.value.pattern) {
        const pattern = new RegExp(selectedIdentifier.value.pattern);

        if (!pattern.test(value)) {
          return new Error(
            `Please enter a valid ${selectedIdentifier.value.label}`
          );
        }
      }

      return true;
    },
  },
  type: {
    message: "Please enter a type",
    required: true,
    trigger: ["blur", "input"],
  },
};

const iconOptions = FALLBACK_JSON;
const typeOptions = PREFIX_JSON;
// const relationTypeOptions = RELATION_TYPE_JSON;

const selectedIdentifier = computed(() => {
  return typeOptions.find((prefix) => prefix.value === formData.type);
});

const saveResourceLoadingIndicator = ref(false);

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
  formData.type = resource.value.type || "url";
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

const saveResourceData = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      const body = {
        title: formData.title,
        description: formData.description,
        icon: formData.icon,
        target: formData.target,
        type: formData.type,
      };

      console.log(body);

      saveResourceLoadingIndicator.value = true;

      const { data, error } = await useFetch(
        `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}`,
        {
          body: JSON.stringify(body),
          headers: useRequestHeaders(["cookie"]),
          method: "PUT",
        }
      );

      saveResourceLoadingIndicator.value = false;

      if (error.value) {
        console.log(error.value);

        push.error({
          title: "Something went wrong",
          message: "We couldn't save your resource",
        });

        throw new Error("Something went wrong");
      }

      if (data.value) {
        push.success({
          title: "Resource saved",
          message: "Your resource has been saved",
        });

        navigateTo(
          `/dashboard/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}`
        );
      }
    } else {
      console.log(errors);
      console.log("Invalid");
    }
  });
};

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
        <h1>Edit resource</h1>

        <div class="flex items-center space-x-2">
          <n-button
            size="large"
            color="black"
            :loading="saveResourceLoadingIndicator"
            @click="saveResourceData"
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
              :placeholder="selectedIdentifier?.placeholder"
              type="text"
              :disabled="!formData.type"
              clearable
              @keydown.enter.prevent
            />

            <n-collapse-transition :show="!!formData.target">
              <p class="mt-2 text-sm text-slate-500">
                Click here to see if your linked resource is available and
                resolves correctly.
              </p>
            </n-collapse-transition>
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

        <!-- <n-form-item path="Relation" label="Relations">
          <div class="flex w-full flex-col">
            <div
              v-for="(item, index) in resource?.Relation || []"
              :key="index"
              class="flex w-full flex-row items-center justify-between space-x-8"
            >
              <n-space vertical class="w-full">
                <div
                  class="flex w-full flex-row items-center justify-between space-x-4"
                >
                  <n-form-item
                    label="Type"
                    :path="`Relation[${index}].type`"
                    :rule="{
                      message: 'Please select the type of this relation',
                      required: true,
                      trigger: ['blur', 'change'],
                    }"
                    class="w-full"
                  >
                    <n-select
                      v-model:value="item.type"
                      placeholder="Is Part Of"
                      clearable
                      :options="relationTypeOptions"
                    />
                  </n-form-item>

                  <n-form-item
                    label="Target"
                    :path="`Relation[${index}].target`"
                    :rule="{
                      message: 'Please enter the target of this relation',
                      required: true,
                      trigger: ['blur', 'input'],
                    }"
                    class="w-full"
                  >
                    <n-input
                      v-model:value="item.target"
                      placeholder="10.1038/s41597-023-02463-x"
                      clearable
                    />
                  </n-form-item>
                </div>
              </n-space>

              <n-popconfirm
                class="self-justify-end"
                @positive-click="removeRelation(item.id)"
              >
                <template #trigger>
                  <n-button class="ml-0" size="large" type="error">
                    <Icon name="gridicons:trash" />
                  </n-button>
                </template>

                Are you sure you want to remove this relation?
              </n-popconfirm>
            </div>
          </div>
        </n-form-item>

        <n-button
          class="mb-10 w-full"
          dashed
          type="success"
          @click="addRelation"
        >
          <template #icon>
            <Icon name="gridicons:create" />
          </template>

          Add a new relation
        </n-button> -->
      </n-form>

      <pre>{{ resource }}</pre>

      <pre>{{ selectedIdentifier }}</pre>
    </div>

    <ModalNewCollection />
  </main>
</template>
