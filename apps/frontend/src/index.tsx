import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  UIRootProviders,
  LoaderProvider,
  ProgressOverlay,
  RouterLoader,
} from "./ui";

import App from "./App";
import { AuthProvider } from "./lib/auth";

const AppWithUI: React.FC = () => {
  return (
    <UIRootProviders>
      <LoaderProvider>
        <ProgressOverlay />
        <BrowserRouter>
          <RouterLoader />
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </LoaderProvider>
    </UIRootProviders>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<AppWithUI />);
