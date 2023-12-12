interface CollectionGETAPIResponse {
  id: string;
  title: string;
  created: string;
  updated: string;
  description: string;
  identifier: string;
  image: string;
  private: boolean;
  resources: ResourceType[];
  version: Version | null;
}

interface Collection {
  id: string;
  title: string;
  created: string;
  updated: string;
  description: string;
  identifier: string;
  image: string;
}

interface Collections extends Array<Collection> {}
