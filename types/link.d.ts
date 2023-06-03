type TargetType = "doi" | "url";

interface LinkType {
  id: string;
  name: string;

  description?: string;
  icon?: string;

  type: TargetType;
  target: string;
}

interface LinksList extends Array<LinkType> {}

interface LocalLinkType extends LinkType {
  action?: "create" | "update" | "delete" | "target_update";

  origin?: "local" | "remote";
}
