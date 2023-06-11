interface ResponseNewProject {
  name: string;
  description: string;
  identifier: string;
  image: string;
  tags: string[];
}

interface ResponseProjectVersionAddEdit {
  status: string;
  version?: string;
  identifier?: string;
}

interface ResponseProject {
  id: string;

  isAuthor: boolean;

  name: string;
  description: string;
  image: string;
  tags: string[];
  created: string;
  updated: string;

  identifier: string;

  versions: AllVersionsType;

  latestVersion: LatestVersion | {};
}
