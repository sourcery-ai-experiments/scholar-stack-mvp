import { defineStore } from "pinia";

export const useLinkStore = defineStore("link", () => {
  const links: Ref<LocalLinkType[]> = ref([]);

  const setLinks = (inputLinks: LocalLinkType[]) => {
    links.value = inputLinks;
  };

  const getLink = (id: string) => {
    return links.value.find((link) => link.id === id);
  };

  const addLink = (link: LocalLinkType) => {
    links.value.push(link);
  };

  const updateLink = (link: LocalLinkType) => {
    const index = links.value.findIndex((l) => l.id === link.id);

    if (index === -1) {
      return;
    }

    links.value[index] = link;
  };

  return { addLink, getLink, links, setLinks, updateLink };
});
