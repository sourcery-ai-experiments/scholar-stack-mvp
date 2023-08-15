<script setup lang="ts">
import { useLinkStore } from "@/stores/link";

defineProps({
  allVersions: {
    required: true,
    type: Array as PropType<AllVersionsItem[]>,
  },
  latestVersion: {
    required: true,
    type: Boolean,
  },
  projectIdentifier: {
    required: true,
    type: String,
  },
});

const message = useMessage();
const linkStore = useLinkStore();

const showAddEditLinkDrawer = ref(false);
const drawerLinkID = ref("");

const allLinks = computed(() => linkStore.links);

const removeLink = (id: string) => {
  if (allLinks.value.length === 1) {
    message.error("You must have at least one link.");

    return;
  }

  const index = allLinks.value.findIndex((link) => link.id === id);

  if (index !== -1) {
    if (allLinks.value[index].origin === "local") {
      allLinks.value.splice(index, 1);
    } else {
      allLinks.value[index].originalAction = allLinks.value[index].action;
      allLinks.value[index].action = "delete";
    }
  }

  message.success("Link removed.");

  if (allLinks.value.length === 1) {
    message.warning(
      "You must have at least one link for this version to be valid."
    );
  }
};

const undoRemoveLink = (id: string) => {
  const index = allLinks.value.findIndex((link) => link.id === id);

  if (index !== -1) {
    if (allLinks.value[index].origin === "remote") {
      const originalAction = allLinks.value[index].originalAction;

      if (originalAction) {
        allLinks.value[index].action = originalAction;
      } else {
        delete allLinks.value[index].action;
      }
    } else {
      allLinks.value.splice(index, 1);
    }
  }

  message.success("Link restored.");
  console.log(allLinks.value);
};

const showAddEditLinkDrawerFunction = (linkID: string) => {
  showAddEditLinkDrawer.value = true;

  if (linkID === "new") {
    drawerLinkID.value = "new";
  } else {
    drawerLinkID.value = linkID;
  }
};

const hideAddEditLinkDrawerFunction = () => {
  showAddEditLinkDrawer.value = false;
};
</script>

<template>
  <div>
    <n-divider v-if="allLinks.length > 0" class="hidden" />

    <div
      v-if="allLinks.length <= 0"
      class="flex flex-col items-center justify-center rounded-lg border border-slate-200 px-3 pb-8 shadow-sm"
    >
      <div class="h-[200px] w-[200px]">
        <client-only>
          <Vue3Lottie
            animation-link="https://assets2.lottiefiles.com/packages/lf20_xu9spfum.json"
            :height="200"
            :width="200"
            class="mx-0"
          />
        </client-only>
      </div>

      <p class="my-4 text-center text-slate-600">
        No resources found for this project.
      </p>

      <n-button
        type="primary"
        size="large"
        class="mt-4"
        @click="showAddEditLinkDrawerFunction('new')"
      >
        <template #icon>
          <Icon name="carbon:add-filled" />
        </template>
        Add a resource
      </n-button>
    </div>
    <div v-else class="flex flex-col px-2 py-4">
      <n-list>
        <n-list-item v-for="link in allLinks" :key="link.id">
          <n-thing class="px-1 py-2" content-indented>
            <template #avatar>
              <Icon
                :name="link.icon"
                size="25"
                :class="{
                  'cursor-not-allowed opacity-70 transition-all':
                    link.action === 'delete',
                }"
              />
            </template>

            <template #header>
              <h4
                class="font-extrabold"
                :class="{
                  'cursor-not-allowed opacity-70 transition-all':
                    link.action === 'delete',
                }"
              >
                {{ link.name }}
              </h4>
            </template>

            <template #header-extra>
              <div class="flex items-center justify-end space-x-4">
                <n-tag
                  v-if="link.action === 'create'"
                  :bordered="false"
                  type="success"
                >
                  New
                </n-tag>

                <n-tag
                  v-if="link.action === 'update'"
                  :bordered="false"
                  type="info"
                >
                  Edited
                </n-tag>

                <n-tag
                  v-if="link.action === 'delete'"
                  :bordered="false"
                  type="error"
                >
                  Marked for deletion
                </n-tag>

                <Icon
                  v-if="link.origin === 'remote'"
                  name="material-symbols:cloud"
                  size="25"
                  :class="{
                    'cursor-not-allowed opacity-70 transition-all':
                      link.action === 'delete',
                  }"
                />

                <Icon
                  :name="link.type === 'doi' ? 'academicons:doi' : 'uil:link'"
                  size="25"
                  :class="{
                    'cursor-not-allowed opacity-70 transition-all':
                      link.action === 'delete',
                  }"
                />
              </div>
            </template>

            <template #description>
              <a
                :href="link.target"
                rel="noopener"
                target="_blank"
                class="font-semibold transition-all hover:text-primary hover:underline"
                :class="{
                  'cursor-not-allowed opacity-70 transition-all':
                    link.action === 'delete',
                }"
              >
                {{ link.target }}</a
              >
            </template>

            <p
              :class="{
                'cursor-not-allowed opacity-70 transition-all':
                  link.action === 'delete',
              }"
            >
              {{ link.description }}
            </p>

            <template #action>
              <div class="flex items-center justify-between pb-2 pt-3">
                <n-button
                  v-if="latestVersion"
                  type="primary"
                  secondary
                  strong
                  :disabled="link.action === 'delete'"
                  @click="showAddEditLinkDrawerFunction(link.id)"
                >
                  <template #icon>
                    <Icon name="material-symbols:edit" />
                  </template>
                  Edit
                </n-button>

                <n-popconfirm
                  v-if="
                    latestVersion &&
                    link.action !== 'delete' &&
                    link.origin === 'remote'
                  "
                  @positive-click="removeLink(link.id)"
                >
                  <template #trigger>
                    <n-button type="error" secondary strong>
                      <template #icon>
                        <Icon name="material-symbols:delete" />
                      </template>
                      Remove from project
                    </n-button>
                  </template>

                  Do you want to remove this resource from your project?
                </n-popconfirm>

                <n-button
                  v-if="
                    latestVersion &&
                    link.action === 'delete' &&
                    link.origin === 'remote'
                  "
                  type="error"
                  secondary
                  strong
                  @click="undoRemoveLink(link.id)"
                >
                  <template #icon>
                    <Icon name="material-symbols:delete" />
                  </template>
                  Undo remove
                </n-button>

                <n-popconfirm
                  v-if="
                    latestVersion &&
                    link.action !== 'delete' &&
                    link.origin === 'local'
                  "
                  @positive-click="removeLink(link.id)"
                >
                  <template #trigger>
                    <n-button type="error" secondary strong>
                      <template #icon>
                        <Icon name="material-symbols:delete" />
                      </template>
                      Delete
                    </n-button>
                  </template>

                  <p class="py-1">
                    <span class="text-base font-medium">
                      Do you still want to delete this resource?
                    </span>
                    <br />
                    <span class="text-xs">
                      This is a permanent action and cannot be undone.
                    </span>
                  </p>
                </n-popconfirm>
              </div>
            </template>
          </n-thing>
        </n-list-item>

        <template #footer>
          <div class="flex justify-between space-x-4">
            <n-button
              v-if="latestVersion"
              type="primary"
              size="large"
              @click="showAddEditLinkDrawerFunction('new')"
            >
              <template #icon>
                <Icon name="carbon:add-filled" />
              </template>

              Add another resource
            </n-button>

            <ModalNewVersion
              :latest-version="latestVersion"
              :all-versions="allVersions"
            />

            <!-- <n-button
              v-if="latestVersion"
              type="primary"
              size="large"
              :loading="showLoader"
              :disabled="!changesPresent"
              @click="checkForChangesToLinks"
            >
              <template #icon>
                <Icon name="material-symbols:save-as" />
              </template>
              Save changes
            </n-button> -->
          </div>
        </template>
      </n-list>
    </div>

    <n-drawer
      v-model:show="showAddEditLinkDrawer"
      default-width="40%"
      placement="right"
      :mask-closable="false"
      :close-on-esc="false"
      :resizable="true"
      :auto-focus="true"
      class="min-w-[450px]"
    >
      <DrawerAddEditLink
        :hide-add-edit-link-drawer-function="hideAddEditLinkDrawerFunction"
        :project-identifier="projectIdentifier"
        :link-identifier="drawerLinkID"
      />
    </n-drawer>
  </div>
</template>
