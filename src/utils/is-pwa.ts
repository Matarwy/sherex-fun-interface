export const isPWA = (): boolean => {
  if (typeof window === "undefined") return false;

  const nav: any = window.navigator as any;
  const standalone = "standalone" in nav ? nav.standalone : undefined;
  const isStandaloneDisplay =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;

  return Boolean(isStandaloneDisplay || standalone === true);
};
