let lockCount: number = 0;
let previousOverflow: string = "";

export const lockBodyScroll = (): (() => void) => {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  lockCount++;

  let released: boolean = false;

  return (): void => {
    if (released) return;

    released = true;
    lockCount = Math.max(0, lockCount - 1);

    if (lockCount === 0) {
      document.body.style.overflow = previousOverflow;
      previousOverflow = "";
    }
  };
};