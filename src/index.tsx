import './index.css';
import { createRoot, hydrateRoot } from "react-dom/client"
import { App } from "./App";
import { langFromPath } from "./i18n/paths";
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

// The language comes from the URL, exactly as the prerender chose it, so the
// hydrated tree matches the server markup.
const lang = langFromPath(window.location.pathname);

// The build prerenders <App /> into dist/index.html and dist/de/index.html so
// crawlers and CV parsers see real content. When that markup is present we
// hydrate it; in dev, or if prerendering ever fails, we fall back to a normal
// client render.
if (root.hasChildNodes()) {
  hydrateRoot(root, <App lang={lang} />);
} else {
  createRoot(root).render(<App lang={lang} />);
}
