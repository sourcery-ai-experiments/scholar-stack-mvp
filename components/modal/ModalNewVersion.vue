<script setup lang="ts">
import { MdEditor } from "md-editor-v3";
import sanitizeHtml from "sanitize-html";
import calver from "calver";

const props = defineProps({
  allVersions: {
    required: true,
    type: Array as PropType<AllVersionsItem[]>,
  },
  latestVersion: {
    required: true,
    type: Boolean,
  },
});

const route = useRoute();
const message = useMessage();

const linkStore = useLinkStore();

const showModal = ref(false);

const releaseNotes = ref("");
const showLoader = ref(false);

const allLinks = computed(() => linkStore.links);

const sanitize = (html: string) => sanitizeHtml(html);

const publishChangesToProject = async (skipNotes = false) => {
  if (!skipNotes) {
    if (releaseNotes.value.trim() === "") {
      message.error("You must add release notes before publishing.");

      return;
    }
  }

  showLoader.value = true;

  try {
    const body = {
      links: allLinks.value.map((link) => {
        return {
          id: link.id,
          name: link.name,
          action: link.action,
          description: link.description,
          icon: link.icon,
          target: link.target,
          type: link.type,
        };
      }),
      releaseNotes: releaseNotes.value || "No release notes provided",
    };

    console.log(body);

    const { data, error } = await useFetch(
      `/api/projects/${route.params.pidentifier}`,
      {
        body: JSON.stringify(body),
        headers: useRequestHeaders(["cookie"]),
        method: "POST",
      }
    );

    console.log("data", data.value);

    if (error.value) {
      const errorMessage = error.value.data.message;
      throw new Error(errorMessage);
    }

    const response = data.value;

    if (response && "body" in response) {
      const responseBody: ResponseProjectVersionAddEdit = JSON.parse(
        response.body as string
      );

      if (responseBody) {
        showLoader.value = false;
        showModal.value = false;

        if (responseBody.status === "new-version-created") {
          message.success("New version created successfully");

          navigateTo(
            `/projects/${route.params.pidentifier}/version/${responseBody.identifier}`
          );
        }

        if (responseBody.status === "no-new-version") {
          message.success(
            "Your changes were saved successfully. Please wait while we sync your data."
          );

          setTimeout(() => {
            // reload the page
            navigateTo(`/projects/${route.params.pidentifier}`);
          }, 1000);
        }
      }
    }
  } catch (error) {
    showLoader.value = false;

    console.error(error);
    message.error("Something went wrong, please try again later");
  }
};

const hideNewVersionModalFunction = () => {
  showModal.value = false;
};

const checkForChangesToLinks = () => {
  // save changes to links
  console.log(allLinks.value);

  showModal.value = allLinks.value.some((link) => {
    if (
      link.action === "create" ||
      link.action === "target_update" ||
      link.action === "delete"
    ) {
      return true;
    }
    return false;
  });

  if (showModal.value) {
    const added: LocalLinkType[] = [];
    const updated: LocalLinkType[] = [];
    const removed: LocalLinkType[] = [];

    allLinks.value.forEach((link) => {
      if (link.action === "create") {
        added.push(link);
      } else if (link.action === "target_update") {
        updated.push(link);
      } else if (link.action === "delete") {
        removed.push(link);
      }
    });

    // Only generate release notes if there are no release notes
    if (releaseNotes.value === "") {
      let changelog = "";

      const latestVersionName =
        (props.allVersions.length > 0 ? props.allVersions[0].name : "") || "";

      console.log(latestVersionName);

      const releaseVersion = calver.inc(
        "yyyy.ww.minor",
        latestVersionName,
        "calendar.minor"
      );

      let header = `# Changelog \n \n`;

      header += `All notable changes to this project are documented here. `;
      header += `This project uses [CalVer](https://calver.org/) for versioning. \n \n`;

      header += `## Version ${releaseVersion} \n \n`;

      changelog = header;

      if (added.length > 0) {
        const addedHeader = `### Added \n \n`;

        let addedContent = "";

        added.forEach((link) => {
          addedContent += `- Added a reference to [${link.name}](${link.target}). \n`;
        });

        addedContent += "\n";

        changelog += addedHeader + addedContent;
      }

      if (updated.length > 0) {
        const updatedHeader = `### Updated \n \n`;

        let updatedContent = "";

        updated.forEach((link) => {
          /**
           * * Somehow adding backticks in a template literal breaks the page rendering
           * ? Might need to look into this later
           */
          updatedContent +=
            "- Updated the link reference of `" +
            link.name +
            "` from `" +
            link.original?.target +
            "` to `" +
            link.target +
            "`. \n";
        });

        updatedContent += "\n";

        changelog += updatedHeader + updatedContent;
      }

      if (removed.length > 0) {
        const removedHeader = `### Removed \n \n`;

        let removedContent = "";

        removed.forEach((link) => {
          removedContent += `- Removed the link reference of [${link.name}](${link.target}). \n`;
        });

        removedContent += "\n";

        changelog += removedHeader + removedContent;
      }

      releaseNotes.value = changelog;
    }
  } else {
    publishChangesToProject(true);
  }
};

const changesPresent = computed(() => {
  return allLinks.value.some((link) => {
    if (
      link.name !== link.original?.name ||
      link.description !== link.original?.description ||
      link.icon !== link.original?.icon ||
      link.target !== link.original?.target ||
      link.type !== link.original?.type
    ) {
      console.log(link, link.original);
      return true;
    }
    return false;
  });
});
</script>

<template>
  <n-button
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
  </n-button>

  <n-modal
    v-model:show="showModal"
    transform-origin="center"
    :mask-closable="false"
    class="custom-card"
    preset="card"
    :style="{ width: '80%' }"
    :bordered="false"
    size="huge"
    :segmented="{ footer: 'soft' }"
  >
    <template #header>
      <div class="flex flex-col">
        <span> Release Notes </span>

        <span class="pt-2 text-sm font-normal text-slate-700">
          The changes to your project will automatically release a new version.
          You can add release notes to describe the changes below.
        </span>
        <span class="text-sm font-normal text-slate-700">
          These notes cannot be edited after the version is released.
        </span>
        <span class="text-sm font-normal"> </span>
      </div>
    </template>

    <MdEditor
      v-model="releaseNotes"
      class="mt-0"
      :class="{
        'opacity-75': showLoader,
        'cursor-not-allowed': showLoader,
      }"
      language="en-US"
      preview-theme="github"
      :show-code-row-number="true"
      :sanitize="sanitize"
    />

    <template #footer>
      <div class="flex justify-end space-x-4">
        <n-button
          size="large"
          type="primary"
          :loading="showLoader"
          @click="publishChangesToProject(false)"
        >
          <template #icon>
            <Icon name="fluent:form-new-48-filled" />
          </template>
          Create new version
        </n-button>

        <n-button
          size="large"
          type="error"
          :disabled="showLoader"
          @click="hideNewVersionModalFunction"
        >
          <template #icon>
            <Icon name="material-symbols:cancel" />
          </template>
          Cancel
        </n-button>
      </div>
    </template>
  </n-modal>
</template>
