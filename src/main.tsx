import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startSync } from "./program/sync";

createRoot(document.getElementById("root")!).render(<App />);

// Field submissions collected offline are delivered as soon as a connection
// is available — including on a cold start, when the device may have been
// offline for hours.
startSync();
