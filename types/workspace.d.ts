interface APIResponseWorkspaceCollectionItem {
  id: string;

  title: string;
  description: string;
  image: string;

  created: string;
  identifier: string;
}

interface APIResponseWorkspace {
  id: string;

  title: string;
  description: string;

  collections: APIResponseWorkspaceCollectionItem[];
}
