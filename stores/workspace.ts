import { defineStore } from "pinia";

export const useWorkspaceStore = defineStore("workspace", () => {
  const newWorkspaceModalIsOpen = ref(false);
  const workspaces = ref<any>([]);
  const workspace = ref<any>(null);

  const showNewWorkspaceModal = () => {
    newWorkspaceModalIsOpen.value = true;
  };

  const hideNewWorkspaceModal = () => {
    newWorkspaceModalIsOpen.value = false;
  };

  const getAllWorkspaces = async () => {
    const { data, error } = await useFetch("/api/workspaces", {
      headers: useRequestHeaders(["cookie"]),
    });

    if (error.value) {
      console.error(error);
    }

    if (data.value) {
      workspaces.value = data.value;
    }
  };

  return {
    getAllWorkspaces,
    hideNewWorkspaceModal,
    newWorkspaceModalIsOpen,
    showNewWorkspaceModal,
    workspaces,
  };
});
