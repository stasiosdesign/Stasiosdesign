// The parts of Barba (pinned at 2.10.3, which ships no types) that live-preview.ts uses
declare module '@barba/core' {
  const barba: {
    hooks: { after: (hook: () => void) => void };
    go: (href: string) => Promise<void>;
  };
  export default barba;
}
