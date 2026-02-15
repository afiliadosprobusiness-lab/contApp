import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.replace("#", ""));
    const el = document.getElementById(id);
    if (!el) return;

    // Match existing landing offsets that rely on scroll-mt-* utilities.
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  return null;
}

