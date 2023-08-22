import { useCallback } from "react";
export const useScrollLock = () => {
  const lockScroll = useCallback((offset?: number) => {
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = (offset ?? 17) + "px";
  }, []);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }, []);
  return {
    lockScroll,
    unlockScroll,
  };
};
