interface InternalRelation {
  id: string;
  source_id: string;
  type: string;
  target_id: string;
  resource_type: string;
  created: string;
  updated: string;
}

interface ExternalRelation {
  id: string;
  source_id: string;
  type: string;
  target: string;
  target_type: string;
  resource_type: string;
  created: string;
  updated: string;
}

interface Relations {
  internal: InternalRelation[];
  external: ExternalRelation[];
}
