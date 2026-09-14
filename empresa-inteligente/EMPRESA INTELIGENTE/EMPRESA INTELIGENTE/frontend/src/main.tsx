import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Amplify } from "aws-amplify";

import "./index.css";
import App from "./App.tsx";

// Configuración de AWS Amplify exclusivamente para
// Amazon Cognito Identity Pool + Face Liveness.
//
// IMPORTANTE:
// No colocamos aquí AWS_ACCESS_KEY_ID ni AWS_SECRET_ACCESS_KEY.
// Las credenciales privadas permanecen en Supabase Edge Functions.
Amplify.configure({
  Auth: {
    Cognito: {
      identityPoolId:
        "us-east-1:1367b83b-1561-4663-8652-9df3349be0c3",
      allowGuestAccess: true,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);