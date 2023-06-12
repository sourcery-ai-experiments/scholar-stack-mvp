interface AllVersionsItem {
  name: string;
  created: string;
  identifier: string;
}

interface AllVersionsType extends Array<AllVersionsItem> {}

interface Version {
  id: string;
  name: string;

  changes?: string;

  created: string;
  updated: string;

  identifier: string;
}

interface VersionWithLinks extends Version {
  links?: Link[];
}
