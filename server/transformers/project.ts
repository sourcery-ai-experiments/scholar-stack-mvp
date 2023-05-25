import type { Project } from "@prisma/client";

export const projectTransformer = (project: Project): ResponseProject => {
  return {
    name: project.name,
    description: project.description,
    identifier: project.identifier,
    image: project.image,
    tags: project.tags,
  };
};
