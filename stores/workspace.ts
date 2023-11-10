import { defineStore } from "pinia";

export const useWorkspaceStore = defineStore("workspace", () => {
  const push = usePush();

  const newWorkspaceModalIsOpen = ref(false);
  const workspaces = ref<Workspaces>([]);
  const workspace = ref<Workspace>({
    id: "",
    title: "",
    created: "",
    description: "",
    personal: false,
  });

  const showNewWorkspaceModal = () => {
    newWorkspaceModalIsOpen.value = true;
  };

  const hideNewWorkspaceModal = () => {
    newWorkspaceModalIsOpen.value = false;
  };

  const fetchWorkspaces = async () => {
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

  const getWorkspace = async (id: string) => {
    if (workspaces.value.length === 0) {
      await fetchWorkspaces();
    }

    const ws = workspaces.value.find((workspace) => workspace.id === id);

    if (ws && workspace.value) {
      workspace.value = ws;
    } else {
      push.error("Workspace not found");
    }
  };

  const createWorkspace = async (body: {
    title: string;
    description: string;
    isPersonal: boolean;
  }) => {
    const { data, error } = await useFetch("/api/workspaces", {
      body: JSON.stringify({
        title: body.title,
        description: body.description,
        personal: body.isPersonal || false,
      }),
      headers: useRequestHeaders(["cookie"]),
      method: "POST",
    });

    if (error.value) {
      console.error(error);

      push.error({
        title: "Something went wrong",
        message: "Please contact support",
      });
    }

    if (data.value) {
      workspaces.value.push(data.value.workspace);

      push.success({
        title: "Workspace created",
        message: "You can now start adding your collections",
      });

      navigateTo(`dashboard/workspaces/${data.value.workspace.id}`);
    }

    // todo: reorder by workspace perhaps
  };

  return {
    createWorkspace,
    fetchWorkspaces,
    getWorkspace,
    hideNewWorkspaceModal,
    newWorkspaceModalIsOpen,
    showNewWorkspaceModal,
    workspace,
    workspaces,
  };
});
