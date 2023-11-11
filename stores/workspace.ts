import { defineStore } from "pinia";

export const useWorkspaceStore = defineStore("workspace", () => {
  const getLoading = ref(false);

  const newWorkspaceModalIsOpen = ref(false);

  const workspaces = ref<Workspaces>([]);

  const showNewWorkspaceModal = () => {
    newWorkspaceModalIsOpen.value = true;
  };

  const hideNewWorkspaceModal = () => {
    newWorkspaceModalIsOpen.value = false;
  };

  const sortWorkspaces = () => {
    // Sort the workspaces by alphabetical order
    workspaces.value.sort((a, b) => {
      if (a.title < b.title) {
        return -1;
      }

      if (a.title > b.title) {
        return 1;
      }

      return 0;
    });

    // move the personal workspace to the top
    const personalWorkspace = workspaces.value.find(
      (workspace) => workspace.personal
    );

    if (personalWorkspace) {
      workspaces.value = [
        personalWorkspace,
        ...workspaces.value.filter((workspace) => !workspace.personal),
      ];
    }
  };

  const fetchWorkspaces = async () => {
    getLoading.value = true;

    const { data, error } = await useFetch("/api/workspaces", {
      headers: useRequestHeaders(["cookie"]),
    });

    getLoading.value = false;

    if (error.value) {
      console.error(error);
    }

    if (data.value) {
      workspaces.value = data.value;

      sortWorkspaces();
    }
  };

  const setWorkspaces = (data: Workspaces) => {
    workspaces.value = data;
  };

  return {
    fetchWorkspaces,
    getLoading,
    hideNewWorkspaceModal,
    newWorkspaceModalIsOpen,
    setWorkspaces,
    showNewWorkspaceModal,
    workspaces,
  };
});
