const relations = [
  {
    description: "indicates that B includes A in a citation",
    label: "Is Cited By",
    mirror: "Cites",
    value: "IsCitedBy",
  },
  {
    description: "indicates that A includes B in a citation",
    label: "Cites",
    mirror: "IsCitedBy",
    value: "Cites",
  },
  {
    description: "indicates that A is a supplement to B",
    label: "Is Supplement To",
    mirror: "IsSupplementedBy",
    value: "IsSupplementTo",
  },
  {
    description: "indicates that B is a supplement to A",
    label: "Is Supplemented By",
    mirror: "IsSupplementTo",
    value: "IsSupplementedBy",
  },
  {
    description: "indicates A is continued by the work B",
    label: "Is Continued By",
    mirror: "Continues",
    value: "IsContinuedBy",
  },
  {
    description: "indicates A is a continuation of the work B",
    label: "Continues",
    mirror: "IsContinuedBy",
    value: "Continues",
  },
  {
    description: "indicates A describes B",
    label: "Describes",
    mirror: "IsDescribedBy",
    value: "Describes",
  },
  {
    description: "indicates A is described by B",
    label: "Is Described By",
    mirror: "Describes",
    value: "IsDescribedBy",
  },
  {
    description: "indicates resource A has additional metadata B",
    label: "Has Metadata",
    mirror: "IsMetadataFor",
    value: "HasMetadata",
  },
  {
    description: "indicates additional metadata A for a resource B",
    label: "Is Metadata For",
    mirror: "HasMetadata",
    value: "IsMetadataFor",
  },
  {
    description: "indicates A has a version (B)",
    label: "Has Version",
    mirror: "IsVersionOf",
    value: "HasVersion",
  },
  {
    description: "indicates A is a version of B",
    label: "Is Version Of",
    mirror: "HasVersion",
    value: "IsVersionOf",
  },
  {
    description:
      "indicates A is a new edition of B, where the new edition has been modified or updated",
    label: "Is NewVersion Of",
    mirror: "IsPreviousVersionOf",
    value: "IsNewVersionOf",
  },
  {
    description: "indicates A is a previous edition of B",
    label: "Is Previous Version Of",
    mirror: "IsNewVersionOf",
    value: "IsPreviousVersionOf",
  },
  {
    description:
      "indicates A is a portion of B; may be used for elements of a series",
    label: "Is Part Of",
    mirror: "HasPart",
    value: "IsPartOf",
  },
  {
    description: "indicates A includes the part B",
    label: "Has Part",
    mirror: "IsPartOf",
    value: "HasPart",
  },
  {
    description:
      "indicates A is published inside B, but is independent of other things published inside of B",
    label: "Is Published In",
    mirror: "",
    value: "IsPublishedIn",
  },
  {
    description: "indicates A is used as a source of information by B",
    label: "Is Referenced By",
    mirror: "References",
    value: "IsReferencedBy",
  },
  {
    description: "indicates B is used as a source of information for A",
    label: "References",
    mirror: "IsReferencedBy",
    value: "References",
  },
  {
    description:
      "indicates B is documentation about/ explaining A; e.g. points to software documentation",
    label: "Is Documented By",
    mirror: "Documents",
    value: "IsDocumentedBy",
  },
  {
    description:
      "indicates A is documentation about B; e.g. points to software documentation",
    label: "Documents",
    mirror: "IsDocumentedBy",
    value: "Documents",
  },
  {
    description: "indicates B is used to compile or create A",
    label: "Is Compiled By",
    mirror: "Compiles",
    value: "IsCompiledBy",
  },
  {
    description:
      "indicates B is the result of a compile or creation event using  A",
    label: "Compiles",
    mirror: "IsCompiledBy",
    value: "Compiles",
  },
  {
    description: "indicates A is a variant or different form of B",
    label: "Is Variant Form Of",
    mirror: "IsOriginalFormOf",
    value: "IsVariantFormOf",
  },
  {
    description: "indicates A is the original form of B",
    label: "Is Original Form Of",
    mirror: "IsVariantFormOf",
    value: "IsOriginalFormOf",
  },
  {
    description:
      "indicates that A is identical to B, for use when there is a need to register two separate instances of the same resource",
    label: "Is Identical To",
    mirror: "IsIdenticalTo",
    value: "IsIdenticalTo",
  },
  {
    description: "indicates that A is reviewed by B",
    label: "Is Reviewed By",
    mirror: "Reviews",
    value: "IsReviewedBy",
  },
  {
    description: "indicates that A is a review of B",
    label: "Reviews",
    mirror: "IsReviewedBy",
    value: "Reviews",
  },
  {
    description: "indicates B is a source upon which A is based",
    label: "Is Derived From",
    mirror: "IsSourceOf",
    value: "IsDerivedFrom",
  },
  {
    description: "indicates A is a source upon which B is based",
    label: "Is Source Of",
    mirror: "IsDerivedFrom",
    value: "IsSourceOf",
  },
  {
    description: "Indicates A is required by B",
    label: "Is Required By",
    mirror: "Requires",
    value: "IsRequiredBy",
  },
  {
    description: "Indicates A requires B",
    label: "Requires",
    mirror: "IsRequiredBy",
    value: "Requires",
  },
  {
    description: "Indicates A replaces B",
    label: "Obsoletes",
    mirror: "IsObsoletedBy",
    value: "Obsoletes",
  },
  {
    description: "Indicates A is replaced by B",
    label: "Is Obsoleted By",
    mirror: "Obsoletes",
    value: "IsObsoletedBy",
  },
];

const getMirrorRelation = (relation: string) => {
  const relationObj = relations.find((r) => r.value === relation);

  if (!relationObj) {
    return null;
  }

  return relationObj.mirror;
};

export default getMirrorRelation;
