interface ResponseNewProject {
  name: string;
  description: string;
  identifier: string;
  image: string;
  tags: string[];
}

interface ResponseProject {
  id: string;

  authorId?: string;
  isAuthor: boolean;

  name: string;
  description: string;
  image: string;
  tags: string[];
  created: Date;
  updated: Date;

  identifier: string;

  versions: AllVersions;

  latestVersion: LatestVersion | {};
}
