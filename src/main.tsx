import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import GameApp from "./GameApp";
import "./index.css";

const DocsApp = lazy(() => import("./App"));
const showDocs = new URLSearchParams(window.location.search).get("view") === "docs";
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}

createRoot(rootElement).render(
  showDocs ? (
    <Suspense fallback={<main style={{ padding: 24, color: "#ddd6c4" }}>در حال باز کردن میز مستندات…</main>}>
      <DocsApp />
    </Suspense>
  ) : (
    <GameApp />
  ),
);
