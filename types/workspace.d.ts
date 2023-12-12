interface APIResponseWorkspaceCollectionItem {
  id: string;

  title: string;
  description: string;
  image: string;

  created: string;
  updated: string;
  identifier: string;
}

interface APIResponseWorkspace {
  id: string;

  title: string;
  description: string;

  personal: boolean;

  collections: APIResponseWorkspaceCollectionItem[];
}

interface Workspace {
  id: string;
  title: string;
  description: string;
  personal: boolean;
  created: string;
}

interface Workspaces extends Array<Workspace> {}
