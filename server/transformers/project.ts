import type { Project } from "@prisma/client";

export const projectTransformer = (project: Project): APIResponseProject => {
  return {
    name: project.name,
    description: project.description,
    identifier: project.identifier,
    image: project.image,
    tags: project.tags,
  };
};
