import { defineStore } from "pinia";

export const useWorkspaceStore = defineStore("workspace", () => {
  const newWorkspaceModalIsOpen = ref(false);

  const showNewWorkspaceModal = () => {
    newWorkspaceModalIsOpen.value = true;
  };

  const hideNewWorkspaceModal = () => {
    newWorkspaceModalIsOpen.value = false;
  };

  return {
    hideNewWorkspaceModal,
    newWorkspaceModalIsOpen,
    showNewWorkspaceModal,
  };
});
