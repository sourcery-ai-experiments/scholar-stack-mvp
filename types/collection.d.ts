interface CollectionGETAPIResponse {
  id: string;
  title: string;
  created: string;
  description: string;
  identifier: string;
  image: string;
  private: boolean;
  resources: ResourceType[];
  version: Version | null;
}
