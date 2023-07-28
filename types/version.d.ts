interface AllVersionsItem {
  name: string;
  updated: string;
  created: string;
  identifier: string;
}

interface AllVersionsType extends Array<AllVersionsItem> {}

interface Version {
  id: string;
  name: string;

  changes?: string;

  created: string;

  identifier: string;
}

interface VersionWithLinks extends Version {
  links?: Link[];
}
