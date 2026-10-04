declare module 'virtual:miller-brand' {
  export const brand: {
    review: boolean;
    live: boolean;
    indexed: boolean;
    direction: 'A' | 'B' | 'C';
    copyDirection: 'A' | 'B' | 'C';
    taglineId: string;
    content: { tagline: string; headline: string; description: string; process: string };
  };
  export const css: string;
}

declare module 'virtual:miller-project-image' {
  const image: import('astro').ImageMetadata;
  export default image;
}
declare module 'virtual:miller-project' {
  export const project: Awaited<ReturnType<typeof import('../../../scripts/project-content.mjs').readProjectContent>>;
}
