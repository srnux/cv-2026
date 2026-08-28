import './index.css';
import { createRoot, hydrateRoot } from "react-dom/client"
import { App } from "./App";
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

// The build prerenders <App /> into dist/index.html so crawlers and CV parsers
// see real content. When that markup is present we hydrate it; in dev, or if
// prerendering ever fails, we fall back to a normal client render.
if (root.hasChildNodes()) {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
