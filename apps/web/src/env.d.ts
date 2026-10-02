declare module 'virtual:miller-brand' {
  export const brand: {
    review: boolean;
    direction: 'A' | 'B' | 'C';
    copyDirection: 'A' | 'B' | 'C';
    taglineId: string;
    content: { tagline: string; headline: string; description: string; process: string };
  };
  export const css: string;
}
