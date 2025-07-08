import { createClient } from "@connect2ic/core";
import { defaultProviders } from "@connect2ic/core/providers";
import { Connect2ICProvider } from "@connect2ic/react";
import "@connect2ic/core/style.css";

// Simplified setup without environment variables for now
const client = createClient({
  providers: defaultProviders,
  globalProviderConfig: {
    host: "http://127.0.0.1:4943",
  },
});

export const withWalletProvider = (App) => (props) => (
  <Connect2ICProvider client={client}>
    <App {...props} />
  </Connect2ICProvider>
); 