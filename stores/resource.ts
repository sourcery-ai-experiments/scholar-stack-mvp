import { defineStore } from "pinia";

export const useResourceStore = defineStore("Resource", () => {
  const getLoading = ref(false);

  const newResourceModalIsOpen = ref(false);

  const resources = ref<ResourceType[]>([]);
  const resource = ref<ResourceType>();

  const sortResources = () => {
    if (resources.value.length === 0) {
      return;
    }

    // remove any resources that have an action of "delete" or "oldVersion"
    resources.value = resources.value.filter(
      (r) => r.action !== "delete" && r.action !== "oldVersion",
    );

    // Sort the resources by alphabetical order
    resources.value.sort((a, b) => {
      if (a.title < b.title) {
        return -1;
      }

      if (a.title > b.title) {
        return 1;
      }

      return 0;
    });
  };

  const fetchResources = async (workspaceid: string, collectionid: string) => {
    getLoading.value = true;

    const { data, error } = await useFetch(
      `/api/workspaces/${workspaceid}/collections/${collectionid}`,
      {
        headers: useRequestHeaders(["cookie"]),
      },
    );

    getLoading.value = false;

    if (error.value) {
      console.error(error);
    }

    if (data.value) {
      resources.value = data.value.resources;

      sortResources();
    }
  };

  const getResource = async (
    workspaceid: string,
    collectionid: string,
    resourceid: string,
  ) => {
    if (resources.value.length === 0) {
      await fetchResources(workspaceid, collectionid);
    }

    resource.value = resources.value.find((r) => r.id === resourceid);
  };

  const showNewResourceModal = () => {
    newResourceModalIsOpen.value = true;
  };

  const hideNewResourceModal = () => {
    newResourceModalIsOpen.value = false;
  };

  return {
    fetchResources,
    getLoading,
    getResource,
    hideNewResourceModal,
    newResourceModalIsOpen,
    resource,
    resources,
    showNewResourceModal,
  };
});
