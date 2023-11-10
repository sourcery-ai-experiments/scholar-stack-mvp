import { defineStore } from "pinia";

export const useResourceStore = defineStore("Resource", () => {
  // todo: remove the modal and take it straight to the new resource page

  const newResourceModalIsOpen = ref(false);

  const showNewResourceModal = () => {
    newResourceModalIsOpen.value = true;
  };

  const hideNewResourceModal = () => {
    newResourceModalIsOpen.value = false;
  };

  return {
    hideNewResourceModal,
    newResourceModalIsOpen,
    showNewResourceModal,
  };
});
