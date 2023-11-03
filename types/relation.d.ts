interface InternalRelation {
  id: string;
  source_id: string;
  type: string | null;
  target_id: string | null;
  resource_type: string | null;
  created: string;
  updated: string;
  origin: "local" | "remote";
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
  origin: "local" | "remote";
}

interface Relations {
  internal: InternalRelation[];
  external: ExternalRelation[];
}
