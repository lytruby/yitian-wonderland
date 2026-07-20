export type PresentationScene = {
  id: string;
  title: string;
  file: string;
  scriptParagraphs?: number;
};

export type PresentationManifest = {
  slug: string;
  title: string;
  coverText: string;
  scenes: PresentationScene[];
  updatedAt: string;
};

export type Presentation = PresentationManifest & {
  script: string;
};

export type PresentationSummary = Pick<
  PresentationManifest,
  "slug" | "title" | "coverText" | "updatedAt"
> & {
  sceneCount: number;
};
