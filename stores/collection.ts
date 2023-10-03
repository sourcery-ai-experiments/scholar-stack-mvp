import { defineStore } from "pinia";

export const useCollectionStore = defineStore("Collection", () => {
  const newCollectionModalIsOpen = ref(false);

  const showNewCollectionModal = () => {
    newCollectionModalIsOpen.value = true;
  };

  const hideNewCollectionModal = () => {
    newCollectionModalIsOpen.value = false;
  };

  return {
    hideNewCollectionModal,
    newCollectionModalIsOpen,
    showNewCollectionModal,
  };
});
