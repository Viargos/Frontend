/**
 * Emergency scroll reset utility
 * Use this to fix scroll issues when modals get stuck
 */

export const forceScrollReset = () => {
  if (typeof window === "undefined") return;

  const body = document.body;
  const html = document.documentElement;

  // Reset all scroll-related styles aggressively
  body.style.overflow = "";
  body.style.position = "";
  body.style.top = "";
  body.style.width = "";
  body.style.height = "";
  body.style.left = "";
  body.style.right = "";
  body.style.margin = "";
  body.style.padding = "";

  html.style.overflow = "";
  html.style.position = "";
  html.style.top = "";
  html.style.width = "";
  html.style.height = "";
  html.style.left = "";
  html.style.right = "";
  html.style.margin = "";
  html.style.padding = "";

  // Remove any potential CSS classes that might lock scroll
  body.classList.remove(
    "modal-open",
    "scroll-locked",
    "overflow-hidden",
    "fixed",
    "no-scroll"
  );
  html.classList.remove(
    "modal-open",
    "scroll-locked",
    "overflow-hidden",
    "fixed",
    "no-scroll"
  );

  // Force multiple reflows
  body.offsetHeight;
  html.offsetHeight;
  window.dispatchEvent(new Event("resize"));

  console.log("🔧 Emergency scroll reset applied!");
};

/**
 * Add this to window for debugging in browser console
 */
if (typeof window !== "undefined") {
  (window as any).forceScrollReset = forceScrollReset;
}

/**
 * Auto-reset scroll on page load if needed
 */
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    // Check if scroll might be stuck
    const body = document.body;
    if (
      body.style.position === "fixed" ||
      body.style.overflow === "hidden"
    ) {
      console.warn("⚠️ Scroll appears to be locked on page load. Auto-fixing...");
      setTimeout(forceScrollReset, 100);
    }
  });
}
