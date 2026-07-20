export type Project = {
  title: string;
  description: string;
  status: "Building" | "Prototype";
  longDescription: string;
};

export type Note = {
  title: string;
  excerpt: string;
  category: string;
};

export type Tool = {
  title: string;
  description: string;
  status: "Available" | "Coming soon" | "Idea";
  href?: string;
};
