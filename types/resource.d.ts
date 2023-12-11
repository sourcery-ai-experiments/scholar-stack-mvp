interface ResourceType {
  id: string;
  title: string;
  back_link_id: string | null;
  description: string;
  icon: string;
  type: string | null;
  action?: string;
  filled_in: boolean;
  target: string;
  created: string;
  updated: string;
}

interface ResourcesListItemChild {
  label: string;
  value: string;
}

interface ResourcesListItemChildren extends Array<ResourcesListItemChild> {}

interface ResourcesListItem {
  children: ResourcesListItemChildren;
  key: string;
  label: string;
  type: string;
}

interface ResourcesList extends Array<ResourcesListItem> {}
