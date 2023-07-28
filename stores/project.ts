import { defineStore } from "pinia";

export const useProjectStore = defineStore("project", () => {
  const links: QueryLinksListItem[] = [];

  const getLink = (id: string) => {
    return links.find((link) => link.id === id);
  };

  const addLink = (link: QueryLinksListItem) => {
    links.push(link);
  };

  const updateLink = (link: QueryLinksListItem) => {
    const index = links.findIndex((l) => l.id === link.id);

    if (index === -1) {
      return;
    }

    links[index] = link;
  };

  return { addLink, getLink, links, updateLink };
});
