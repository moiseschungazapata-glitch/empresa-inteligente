import {
  useEffect,
  useState,
  type FormEvent,
  type CSSProperties,
  type MouseEvent,
} from "react";

import { createClient } from "@supabase/supabase-js";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import "@aws-amplify/ui-react/styles.css";
import { supabase } from "../../services/supabaseClient";

// ============================================================
// CLIENTE TEMPORAL
// Valida la contraseña SIN persistir la sesión todavía.
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const tempSupabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

interface LoginProps {
  onLoginSuccess?: () => void;
  onRegister?: () => void;
}

type Step = "access" | "code" | "identity";

export default function Login({
  onLoginSuccess,
  onRegister,
}: LoginProps) {

  // ============================================================
  // ESTADOS
  // ============================================================

  const [step, setStep] = useState<Step>("access");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Amazon Rekognition Face Liveness
  const [livenessSessionId, setLivenessSessionId] =
    useState<string | null>(null);
  const [livenessLoading, setLivenessLoading] =
    useState(false);
  const [livenessCompleted, setLivenessCompleted] =
    useState(false);

  const [identityResult, setIdentityResult] = useState<
    "enrolled" | "verified" | null
  >(null);

  // Se conserva para animar el personaje del panel izquierdo
  // durante la verificación facial.
  const [verifyingFace, setVerifyingFace] =
    useState(false);

  const [activeField, setActiveField] = useState<
    "email" | "password" | null
  >(null);

  // Posición de los ojos
  const [eyePosition, setEyePosition] = useState({
    x: 0,
    y: 0,
  });

  // ============================================================
  // OJOS SIGUEN EL CURSOR
  // ============================================================

  const handleMouseMove = (
    e: MouseEvent<HTMLDivElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const normalizedX =
      ((e.clientX - rect.left) / rect.width) * 2 - 1;

    const normalizedY =
      ((e.clientY - rect.top) / rect.height) * 2 - 1;

    setEyePosition({
      x: normalizedX * 7,
      y: normalizedY * 5,
    });
  };

  const handleMouseLeave = () => {
    setEyePosition({
      x: 0,
      y: 0,
    });
  };

  // ============================================================
  // TEMPORIZADOR OTP
  // ============================================================

  useEffect(() => {
    let interval:
      | ReturnType<typeof setInterval>
      | undefined;

    if (step === "code" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }

    if (resendTimer === 0) {
      setCanResend(true);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [step, resendTimer]);

  // ============================================================
  // AMAZON REKOGNITION - FACE LIVENESS
  // ============================================================

  // El componente de AWS maneja la cámara y el streaming.
  // Aquí solo creamos la sesión desde nuestro backend seguro.
  const createLivenessSession = async () => {
    if (livenessLoading) return;

    setLivenessLoading(true);
    setVerifyingFace(true);
    setError(null);
    setLivenessCompleted(false);
    setIdentityResult(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "La sesión de usuario no está disponible."
        );
      }

      const { data, error: functionError } =
        await supabase.functions.invoke(
          "create-face-liveness-session",
          {
            body: {},
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

      if (functionError) {
        console.error(
          "Error en create-face-liveness-session:",
          functionError
        );

        throw new Error(
          "No se pudo iniciar la verificación facial."
        );
      }

      if (!data?.sessionId) {
        throw new Error(
          "Amazon Rekognition no devolvió un SessionId válido."
        );
      }

      console.info(
        "Sesión Face Liveness creada correctamente."
      );

      setLivenessSessionId(data.sessionId);
    } catch (err: unknown) {
      console.error(
        "Error creando sesión Face Liveness:",
        err
      );

      setVerifyingFace(false);
      setLivenessSessionId(null);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar la verificación facial."
      );
    } finally {
      setLivenessLoading(false);
    }
  };

  // Lee el cuerpo JSON devuelto por una Edge Function cuando
  // Supabase responde con un error HTTP (403, 409, etc.).
  const readFunctionErrorBody = async (
    functionError: unknown
  ): Promise<Record<string, unknown> | null> => {
    try {
      if (
        typeof functionError !== "object" ||
        functionError === null ||
        !("context" in functionError)
      ) {
        return null;
      }

      const context = (
        functionError as { context?: Response }
      ).context;

      if (!context) {
        return null;
      }

      return (await context.clone().json()) as Record<
        string,
        unknown
      >;
    } catch {
      return null;
    }
  };

  // AWS llama este callback cuando termina la captura de Face Liveness.
  // Aquí hacemos la autorización facial real:
  // 1) si el usuario ya tiene rostro -> verify-face
  // 2) si todavía no tiene rostro -> enroll-face
  const handleLivenessComplete = async () => {
    if (!livenessSessionId) {
      setVerifyingFace(false);
      setError(
        "No existe una sesión de verificación facial."
      );
      return;
    }

    setLivenessLoading(true);
    setError(null);
    setIdentityResult(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "La sesión de usuario no está disponible."
        );
      }

      const invokeFaceFunction = async (
        functionName: "verify-face" | "enroll-face"
      ) => {
        const { data, error: functionError } =
          await supabase.functions.invoke(functionName, {
            body: {
              sessionId: livenessSessionId,
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

        if (!functionError) {
          return {
            data: data as Record<string, unknown> | null,
            status: 200,
            error: null as unknown,
          };
        }

        const errorBody =
          await readFunctionErrorBody(functionError);

        let status = 0;

        if (
          typeof functionError === "object" &&
          functionError !== null &&
          "context" in functionError
        ) {
          const context = (
            functionError as { context?: Response }
          ).context;

          status = context?.status ?? 0;
        }

        return {
          data:
            errorBody ??
            (data as Record<string, unknown> | null),
          status,
          error: functionError,
        };
      };

      // ----------------------------------------------------------
      // PRIMERO INTENTAMOS VERIFICAR EL ROSTRO
      // ----------------------------------------------------------

      const verifyResult =
        await invokeFaceFunction("verify-face");

      const verifyCode =
        typeof verifyResult.data?.code === "string"
          ? verifyResult.data.code
          : null;

      // ----------------------------------------------------------
      // PRIMER ACCESO: EL USUARIO AÚN NO TIENE ROSTRO REGISTRADO
      // ----------------------------------------------------------

      if (verifyCode === "FACE_NOT_ENROLLED") {
        console.info(
          "El usuario todavía no tiene rostro. Iniciando registro facial..."
        );

        const enrollResult =
          await invokeFaceFunction("enroll-face");

        if (enrollResult.error) {
          const enrollMessage =
            typeof enrollResult.data?.error === "string"
              ? enrollResult.data.error
              : "No se pudo registrar el rostro del usuario.";

          throw new Error(enrollMessage);
        }

        if (enrollResult.data?.success !== true) {
          throw new Error(
            "AWS no confirmó el registro facial."
          );
        }

        console.info(
          "Rostro registrado correctamente:",
          enrollResult.data
        );

        setIdentityResult("enrolled");
        setLivenessCompleted(true);
        setVerifyingFace(false);

        // Pequeña pausa para mostrar la confirmación visual.
        await new Promise((resolve) =>
          setTimeout(resolve, 900)
        );

        if (!onLoginSuccess) {
          throw new Error(
            "No se pudo completar la autorización del acceso."
          );
        }

        onLoginSuccess();
        return;
      }

      // ----------------------------------------------------------
      // USUARIO YA REGISTRADO: DEBE COINCIDIR CON SU FACE ID
      // ----------------------------------------------------------

      if (verifyResult.error) {
        const verifyMessage =
          typeof verifyResult.data?.error === "string"
            ? verifyResult.data.error
            : "No se pudo verificar la identidad facial.";

        // 401/403 = sesión inválida, Liveness insuficiente o
        // el rostro no corresponde al usuario autenticado.
        if (
          verifyResult.status === 401 ||
          verifyResult.status === 403
        ) {
          console.warn(
            "Acceso facial rechazado:",
            verifyResult.data
          );

          await supabase.auth.signOut();
          setStep("access");
          setToken("");
          setPassword("");
          setLivenessSessionId(null);
        }

        throw new Error(verifyMessage);
      }

      if (
        verifyResult.data?.success !== true ||
        verifyResult.data?.verified !== true
      ) {
        throw new Error(
          "La identidad facial no pudo ser confirmada."
        );
      }

      console.info(
        "Identidad facial verificada correctamente:",
        verifyResult.data
      );

      setIdentityResult("verified");
      setLivenessCompleted(true);
      setVerifyingFace(false);

      // Pequeña pausa para mostrar la confirmación visual.
      await new Promise((resolve) =>
        setTimeout(resolve, 900)
      );

      if (!onLoginSuccess) {
        throw new Error(
          "No se pudo completar la autorización del acceso."
        );
      }

      onLoginSuccess();
    } catch (err: unknown) {
      console.error(
        "Error en autenticación facial:",
        err
      );

      setVerifyingFace(false);
      setLivenessSessionId(null);
      setLivenessCompleted(false);
      setIdentityResult(null);

      setError(
        err instanceof Error
          ? err.message
          : "La verificación facial no pudo completarse."
      );
    } finally {
      setLivenessLoading(false);
    }
  };

  // ============================================================
  // LIMPIEZA DEL ESTADO DE LIVENESS
  // ============================================================

  useEffect(() => {
    if (step !== "identity") {
      setLivenessSessionId(null);
      setLivenessLoading(false);
      setLivenessCompleted(false);
      setIdentityResult(null);
      setVerifyingFace(false);
    }
  }, [step]);

  // ============================================================
  // PASO 1
  // CORREO + CONTRASEÑA
  // ============================================================

  const handleAccessSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // Validamos las credenciales SIN guardar la sesión.
      const {
        data: authData,
        error: authError,
      } =
        await tempSupabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError || !authData.user) {
        console.error(
          "Error de autenticación:",
          authError
        );

        throw new Error(
          authError?.message ||
            "Correo o contraseña incorrectos."
        );
      }

      // Enviamos OTP
      const { error: otpError } =
        await tempSupabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: false,
          },
        });

      if (otpError) {
        console.error(
          "Error enviando OTP:",
          otpError
        );

        if (otpError.status === 429) {
          throw new Error(
            "Demasiados intentos. Espera unos minutos antes de volver a intentar."
          );
        }

        throw new Error(
          otpError.message ||
            "No se pudo enviar el código OTP."
        );
      }

      setStep("code");
      setResendTimer(60);
      setCanResend(false);

    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "Ocurrió un error al procesar la solicitud."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // REENVIAR OTP
  // ============================================================

  const handleResendOtp = async () => {
    if (!canResend || loading) return;

    setLoading(true);
    setError(null);

    try {
      const { error: otpError } =
        await tempSupabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: false,
          },
        });

      if (otpError) {
        throw new Error(
          otpError.message ||
            "No se pudo reenviar el código."
        );
      }

      setResendTimer(60);
      setCanResend(false);

    } catch (err: any) {
      console.error(err);
      setError(err.message);

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PASO 2
  // OTP
  // ============================================================

  const handleCodeSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // AQUÍ se utiliza el cliente PRINCIPAL.
      // Aquí se crea la sesión oficial.
      const { error } =
        await supabase.auth.verifyOtp({
          email: email.trim(),
          token: token.trim(),
          type: "email",
        });

      if (error) {
        console.error(
          "Error verificando OTP:",
          error
        );

        throw new Error(
          "El código OTP es inválido o ha expirado."
        );
      }

      setLivenessSessionId(null);
      setLivenessLoading(false);
      setLivenessCompleted(false);
      setVerifyingFace(false);

      setStep("identity");

    } catch (err: any) {
      setError(
        err.message ||
          "Código incorrecto."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PASO 3
  // VERIFICACIÓN FACIAL
  // ============================================================

  // ============================================================
  // ESTILOS DEL PERSONAJE
  // ============================================================

  const pupilStyle = {
    transform: `translate(
      ${eyePosition.x}px,
      ${eyePosition.y}px
    )`,
  };

  const buttonStyle: CSSProperties = {
    width: "100%",
    height: "52px",
    border: "none",
    borderRadius: "12px",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    transition: "0.2s ease",
    opacity: loading ? 0.65 : 1,
  };

  // ============================================================
  // INTERFAZ
  // ============================================================

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        /* =====================================================
           PÁGINA
        ===================================================== */

        .login-page {
          min-height: 100vh;
          width: 100%;
          background: #f4f5f7;
          display: flex;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* =====================================================
           PANEL IZQUIERDO
        ===================================================== */

        .login-visual {
          width: 50%;
          min-height: 100vh;

          background:
            radial-gradient(
              circle at 50% 45%,
              #202631 0%,
              #0b0d11 38%,
              #050608 72%
            );

          color: white;
          position: relative;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 50px;
        }

        .visual-grid {
          position: absolute;
          inset: 0;
          opacity: 0.08;

          background-image:
            linear-gradient(
              rgba(255,255,255,0.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.08) 1px,
              transparent 1px
            );

          background-size: 55px 55px;
        }

        .visual-content {
          width: 100%;
          max-width: 560px;
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .brand-mini {
          position: absolute;
          top: 42px;
          left: 48px;

          display: flex;
          align-items: center;
          gap: 10px;

          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.2px;
        }

        .brand-mini-icon {
          width: 32px;
          height: 32px;

          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 9px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 11px;
          font-weight: 900;

          background: rgba(255,255,255,0.05);
        }

        .mascot-area {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .mascot-glow {
          width: 360px;
          height: 360px;
          border-radius: 50%;

          position: absolute;

          background:
            rgba(56,189,248,0.08);

          filter: blur(35px);

          animation:
            mascotAmbientGlow
            5s ease-in-out infinite;
        }

        /* =====================================================
           PERSONAJE PRINCIPAL
        ===================================================== */

        .mascot-shell {
          width: 270px;
          height: 270px;

          border-radius: 70px;

          background:
            linear-gradient(
              145deg,
              #1b2028,
              #0d1015
            );

          border: 1px solid
            rgba(255,255,255,0.12);

          box-shadow:
            0 40px 100px rgba(0,0,0,0.55),
            inset 0 1px 0
              rgba(255,255,255,0.08);

          display: flex;
          align-items: center;
          justify-content: center;

          position: relative;

          animation:
            mascotFloat
            5s ease-in-out infinite;

          transition:
            transform 0.6s
              cubic-bezier(.2,.8,.2,1),
            box-shadow 0.6s ease,
            border-color 0.6s ease;
        }

        .mascot-shell::before {
          content: "";

          position: absolute;
          inset: 15px;

          border-radius: 58px;

          border:
            1px solid
            rgba(255,255,255,0.05);

          transition:
            0.6s ease;
        }

        /* =====================================================
           ESTADO ACCESO
        ===================================================== */

        .mascot-access {
          animation:
            mascotFloat
            5s ease-in-out infinite,
            accessBreathing
            4s ease-in-out infinite;
        }

        /* =====================================================
           ESTADO OTP
        ===================================================== */

        .mascot-code {
          transform:
            translateY(-8px)
            scale(1.035);

          border-color:
            rgba(56,189,248,0.45);

          box-shadow:
            0 40px 100px rgba(0,0,0,0.55),
            0 0 45px
              rgba(56,189,248,0.10),
            0 0 100px
              rgba(56,189,248,0.08),
            inset 0 1px 0
              rgba(255,255,255,0.08);

          animation:
            mascotFloatCode
            3.8s ease-in-out infinite,
            otpPulse
            1.8s ease-in-out infinite;
        }

        .mascot-code::before {
          inset: 9px;

          border-radius: 61px;

          border-color:
            rgba(56,189,248,0.12);

          animation:
            innerTechPulse
            1.8s ease-in-out infinite;
        }

        /* =====================================================
           ESTADO IDENTIDAD
        ===================================================== */

        .mascot-identity {
          transform:
            translateY(-10px)
            scale(1.055);

          border-color:
            rgba(56,189,248,0.55);

          box-shadow:
            0 40px 100px rgba(0,0,0,0.55),
            0 0 55px
              rgba(56,189,248,0.15),
            0 0 110px
              rgba(56,189,248,0.08),
            inset 0 1px 0
              rgba(255,255,255,0.08);

          animation:
            mascotFloatIdentity
            3s ease-in-out infinite,
            identityPulse
            1.4s ease-in-out infinite;
        }

        /* =====================================================
           ESTADO CONTRASEÑA
        ===================================================== */

        .mascot-password .mascot-face {
          transform:
            scale(0.98)
            translateY(4px);
        }

        .mascot-password .mascot-mouth {
          width: 22px;
          height: 3px;
          bottom: 29px;
        }

        /* =====================================================
           CARA
        ===================================================== */

        .mascot-face {
          width: 170px;
          height: 140px;

          border-radius: 46px;

          background: #f8fafc;

          position: relative;

          display: flex;
          justify-content: center;
          align-items: center;

          gap: 25px;

          box-shadow:
            0 20px 50px
              rgba(0,0,0,0.3);

          transition:
            transform 0.6s
              cubic-bezier(.2,.8,.2,1),
            border-radius 0.5s ease,
            box-shadow 0.5s ease;
        }

        .mascot-code .mascot-face {
          border-radius: 41px;

          box-shadow:
            0 20px 50px
              rgba(0,0,0,0.3),
            0 0 25px
              rgba(56,189,248,0.10);

          animation:
            faceScanning
            1.8s ease-in-out infinite;
        }

        .mascot-identity .mascot-face {
          border-radius: 37px;

          box-shadow:
            0 20px 50px
              rgba(0,0,0,0.3),
            0 0 30px
              rgba(56,189,248,0.18);

          animation:
            identityFace
            1.5s ease-in-out infinite;
        }

        /* =====================================================
           OJOS
        ===================================================== */

        .eye {
          width: 40px;
          height: 54px;

          border-radius: 22px;

          background: #0a0d12;

          display: flex;
          justify-content: center;
          align-items: center;

          overflow: hidden;

          transition:
            height 0.35s ease,
            margin-top 0.35s ease,
            border-radius 0.35s ease,
            transform 0.35s ease;
        }

        .pupil {
          width: 15px;
          height: 20px;

          border-radius: 50%;

          background: #38bdf8;

          box-shadow:
            0 0 15px
              rgba(56,189,248,0.8);

          transition:
            transform 0.08s linear,
            background 0.3s ease,
            box-shadow 0.3s ease;
        }

        /* OJOS OTP */

        .mascot-code .eye {
          height: 43px;

          margin-top: 2px;

          transform:
            scaleY(0.94);
        }

        .mascot-code .pupil {
          background: #67e8f9;

          box-shadow:
            0 0 12px
              rgba(103,232,249,0.8),
            0 0 25px
              rgba(103,232,249,0.35);

          animation:
            otpEyeScan
            1.15s ease-in-out infinite;
        }

        .mascot-code .eye:nth-child(1) {
          animation:
            eyeAlertLeft
            2.2s ease-in-out infinite;
        }

        .mascot-code .eye:nth-child(2) {
          animation:
            eyeAlertRight
            2.2s ease-in-out infinite;
        }

        /* OJOS IDENTIDAD */

        .mascot-identity .eye {
          height: 48px;

          border-radius: 25px;

          transform:
            scaleY(0.96);
        }

        .mascot-identity .pupil {
          background: #38bdf8;

          box-shadow:
            0 0 16px
              rgba(56,189,248,0.9),
            0 0 32px
              rgba(56,189,248,0.45);

          animation:
            identityEyes
            1.1s ease-in-out infinite;
        }

        /* CONTRASEÑA */

        .mascot-password .eye {
          height: 12px !important;

          margin-top: 18px !important;

          border-radius: 50%;
        }

        .mascot-password .pupil {
          opacity: 0;
        }

        /* =====================================================
           BOCA
        ===================================================== */

        .mascot-mouth {
          position: absolute;

          bottom: 27px;

          width: 28px;
          height: 4px;

          border-radius: 10px;

          background: #0a0d12;

          transition:
            width 0.4s ease,
            height 0.4s ease,
            border-radius 0.4s ease,
            bottom 0.4s ease;
        }

        .mascot-code .mascot-mouth {
          width: 24px;
          height: 5px;

          border-radius:
            0 0 15px 15px;

          bottom: 25px;

          animation:
            mouthCode
            1.8s ease-in-out infinite;
        }

        .mascot-identity .mascot-mouth {
          width: 18px;
          height: 7px;

          border-radius: 50%;

          bottom: 25px;

          animation:
            mouthIdentity
            1.4s ease-in-out infinite;
        }

        /* =====================================================
           ANILLO TECNOLÓGICO OTP
        ===================================================== */

        .mascot-code::after {
          content: "";

          position: absolute;

          width: 224px;
          height: 224px;

          border-radius: 50%;

          border:
            1px solid
            rgba(56,189,248,0.12);

          border-top-color:
            rgba(56,189,248,0.65);

          border-right-color:
            rgba(56,189,248,0.25);

          animation:
            techRing
            3.2s linear infinite;

          pointer-events: none;
        }

        /* =====================================================
           ANILLO IDENTIDAD
        ===================================================== */

        .mascot-identity::after {
          content: "";

          position: absolute;

          width: 230px;
          height: 230px;

          border-radius: 50%;

          border:
            1px solid
            rgba(56,189,248,0.14);

          border-top-color:
            rgba(56,189,248,0.8);

          border-bottom-color:
            rgba(56,189,248,0.45);

          animation:
            identityRing
            2s linear infinite;

          pointer-events: none;
        }

        /* =====================================================
           ESTADO VERIFICANDO
        ===================================================== */

        .mascot-verifying {
          animation:
            mascotFloatIdentity
            2.2s ease-in-out infinite,
            identityPulseStrong
            1s ease-in-out infinite;
        }

        .mascot-verifying .mascot-face {
          animation:
            verifyingFace
            0.8s ease-in-out infinite;
        }

        .mascot-verifying .pupil {
          animation:
            verifyingEyes
            0.55s ease-in-out infinite;
        }

        .mascot-verifying .mascot-mouth {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        /* =====================================================
           ESTADO DEL SISTEMA
        ===================================================== */

        .mascot-status {
          margin-top: 34px;

          font-size: 12px;

          color: #94a3b8;

          letter-spacing: 1.5px;

          text-transform: uppercase;

          font-weight: 700;

          transition:
            color 0.4s ease,
            transform 0.4s ease;
        }

        .mascot-code ~ .mascot-status {
          color: #67e8f9;
        }

        .visual-title {
          margin-top: 14px;

          font-size: 31px;

          font-weight: 800;

          letter-spacing: -1.2px;
        }

        .visual-description {
          margin: 10px auto 0;

          max-width: 420px;

          color: #7f8a9b;

          font-size: 14px;

          line-height: 1.7;
        }

        .visual-footer {
          position: absolute;

          bottom: 38px;

          left: 48px;
          right: 48px;

          display: flex;

          justify-content: space-between;

          color: #596272;

          font-size: 11px;
        }

        .visual-footer span:first-child {
          color: #8b95a5;
        }

        /* =====================================================
           PANEL DERECHO
        ===================================================== */

        .login-form-panel {
          width: 50%;

          min-height: 100vh;

          background: #ffffff;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 60px 8%;
        }

        .login-form-container {
          width: 100%;
          max-width: 430px;
        }

        .form-brand {
          display: none;
        }

        .form-kicker {
          color: #64748b;

          font-size: 11px;

          text-transform: uppercase;

          letter-spacing: 1.5px;

          font-weight: 800;

          margin-bottom: 12px;
        }

        .form-title {
          color: #0f172a;

          font-size: 34px;

          line-height: 1.15;

          letter-spacing: -1.5px;

          margin: 0;

          font-weight: 800;
        }

        .form-description {
          color: #64748b;

          font-size: 14px;

          line-height: 1.6;

          margin: 12px 0 32px;
        }

        .input-group {
          margin-bottom: 19px;
        }

        .input-label {
          display: block;

          margin-bottom: 8px;

          font-size: 12px;

          color: #334155;

          font-weight: 700;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;

          left: 16px;

          top: 50%;

          transform:
            translateY(-50%);

          color: #94a3b8;

          font-size: 13px;

          pointer-events: none;
        }

        .login-input {
          width: 100%;

          height: 52px;

          border:
            1px solid #e2e8f0;

          background: #f8fafc;

          border-radius: 12px;

          padding: 0 45px;

          color: #0f172a;

          outline: none;

          font-size: 14px;

          transition: 0.2s ease;
        }

        .login-input:focus {
          border-color: #0f172a;

          background: #ffffff;

          box-shadow:
            0 0 0 3px
            rgba(15,23,42,0.06);
        }

        .password-toggle {
          position: absolute;

          right: 14px;

          top: 50%;

          transform:
            translateY(-50%);

          border: none;

          background: transparent;

          color: #64748b;

          cursor: pointer;

          font-size: 13px;
        }

        .form-options {
          display: flex;

          justify-content: space-between;

          align-items: center;

          margin: 2px 0 25px;
        }

        .remember {
          display: flex;

          align-items: center;

          gap: 7px;

          color: #64748b;

          font-size: 12px;

          cursor: pointer;
        }

        .remember input {
          accent-color: #0f172a;
        }

        .forgot {
          border: none;

          background: transparent;

          color: #0f172a;

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;
        }

        .main-button:hover {
          transform:
            translateY(-1px);

          box-shadow:
            0 10px 25px
            rgba(15,23,42,0.16);
        }

        .register-line {
          text-align: center;

          margin-top: 24px;

          color: #94a3b8;

          font-size: 12px;
        }

        .register-button {
          border: none;

          background: transparent;

          color: #0f172a;

          font-weight: 800;

          cursor: pointer;

          padding: 0;

          font-size: 12px;
        }

        .security-line {
          margin-top: 38px;

          padding-top: 18px;

          border-top:
            1px solid #f1f5f9;

          display: flex;

          justify-content: center;

          gap: 7px;

          color: #94a3b8;

          font-size: 10px;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .error-box {
          background: #fff5f5;

          border:
            1px solid #fecaca;

          color: #b91c1c;

          border-radius: 10px;

          padding: 12px 14px;

          font-size: 12px;

          line-height: 1.5;

          margin-bottom: 20px;
        }

        /* =====================================================
           STEPS
        ===================================================== */

        .step-header {
          display: flex;

          align-items: center;

          gap: 8px;

          margin-bottom: 26px;
        }

        .step-dot {
          width: 28px;
          height: 4px;

          border-radius: 10px;

          background: #e2e8f0;
        }

        .step-dot.active {
          background: #0f172a;
        }

        .step-text {
          color: #94a3b8;

          font-size: 11px;

          font-weight: 700;

          margin-left: 5px;
        }

        /* =====================================================
           OTP
        ===================================================== */

        .otp-input {
          width: 100%;

          height: 65px;

          background: #f8fafc;

          border:
            1px solid #e2e8f0;

          border-radius: 14px;

          text-align: center;

          letter-spacing: 9px;

          font-size: 25px;

          font-weight: 800;

          color: #0f172a;

          outline: none;

          margin-bottom: 18px;
        }

        .otp-input:focus {
          border-color: #0f172a;

          background: #ffffff;
        }

        .resend {
          text-align: center;

          margin: 18px 0;

          font-size: 12px;

          color: #94a3b8;
        }

        .resend-button {
          border: none;

          background: transparent;

          color: #0f172a;

          font-weight: 800;

          cursor: pointer;
        }

        .back-button {
          width: 100%;

          border: none;

          background: transparent;

          color: #64748b;

          cursor: pointer;

          font-size: 12px;

          margin-top: 10px;
        }

        /* =====================================================
           CÁMARA
        ===================================================== */

        .camera-box {
          width: 100%;

          height: 260px;

          background: #050608;

          border-radius: 18px;

          overflow: hidden;

          position: relative;

          border:
            1px solid #1e293b;

          margin-bottom: 20px;
        }

        .camera-video {
          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .camera-overlay {
          position: absolute;

          inset: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          pointer-events: none;
        }

        .face-frame {
          width: 145px;
          height: 190px;

          border:
            1px solid
            rgba(255,255,255,0.8);

          border-radius:
            48% 48% 44% 44%;

          position: relative;
        }

        .scan-line {
          position: absolute;

          left: 10px;
          right: 10px;

          height: 2px;

          background: #38bdf8;

          box-shadow:
            0 0 12px #38bdf8;

          animation:
            scan 2s linear infinite;
        }

        .camera-message {
          position: absolute;

          inset: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          color: white;

          font-size: 12px;

          background:
            rgba(0,0,0,0.45);
        }

        .verify-overlay {
          position: absolute;

          inset: 0;

          display: flex;

          flex-direction: column;

          justify-content: center;

          align-items: center;

          gap: 10px;

          background:
            rgba(5,6,8,0.72);

          color: white;

          font-size: 13px;

          font-weight: 700;
        }

        .verify-ring {
          width: 44px;
          height: 44px;

          border:
            3px solid
            rgba(255,255,255,0.2);

          border-top-color:
            #38bdf8;

          border-radius: 50%;

          animation:
            spin 0.8s linear infinite;
        }

        /* =====================================================
           ANIMACIONES PERSONAJE
        ===================================================== */

        @keyframes mascotFloat {
          0%, 100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(-9px);
          }
        }

        @keyframes mascotFloatCode {
          0%, 100% {
            transform:
              translateY(-5px)
              scale(1.035);
          }

          50% {
            transform:
              translateY(-14px)
              scale(1.045);
          }
        }

        @keyframes mascotFloatIdentity {
          0%, 100% {
            transform:
              translateY(-6px)
              scale(1.055);
          }

          50% {
            transform:
              translateY(-15px)
              scale(1.07);
          }
        }

        @keyframes accessBreathing {
          0%, 100% {
            box-shadow:
              0 40px 100px
              rgba(0,0,0,0.55),
              inset 0 1px 0
              rgba(255,255,255,0.08);
          }

          50% {
            box-shadow:
              0 40px 100px
              rgba(0,0,0,0.55),
              0 0 35px
              rgba(56,189,248,0.05),
              inset 0 1px 0
              rgba(255,255,255,0.08);
          }
        }

        @keyframes mascotAmbientGlow {
          0%, 100% {
            opacity: 0.55;
            transform:
              scale(0.92);
          }

          50% {
            opacity: 0.9;
            transform:
              scale(1.08);
          }
        }

        @keyframes otpPulse {
          0%, 100% {
            box-shadow:
              0 40px 100px
              rgba(0,0,0,0.55),
              0 0 45px
              rgba(56,189,248,0.08),
              inset 0 1px 0
              rgba(255,255,255,0.08);
          }

          50% {
            box-shadow:
              0 40px 100px
              rgba(0,0,0,0.55),
              0 0 80px
              rgba(56,189,248,0.22),
              0 0 120px
              rgba(56,189,248,0.08),
              inset 0 1px 0
              rgba(255,255,255,0.08);
          }
        }

        @keyframes innerTechPulse {
          0%, 100% {
            opacity: 0.5;
            transform:
              scale(0.98);
          }

          50% {
            opacity: 1;
            transform:
              scale(1.01);
          }
        }

        @keyframes techRing {
          from {
            transform:
              rotate(0deg)
              scale(0.96);
          }

          to {
            transform:
              rotate(360deg)
              scale(0.96);
          }
        }

        @keyframes otpEyeScan {
          0%, 100% {
            transform:
              translateX(-3px)
              scale(0.9);
          }

          50% {
            transform:
              translateX(3px)
              scale(1.05);
          }
        }

        @keyframes eyeAlertLeft {
          0%, 100% {
            transform:
              translateY(0);
          }

          45% {
            transform:
              translateY(-2px);
          }

          55% {
            transform:
              translateY(1px);
          }
        }

        @keyframes eyeAlertRight {
          0%, 100% {
            transform:
              translateY(0);
          }

          45% {
            transform:
              translateY(1px);
          }

          55% {
            transform:
              translateY(-2px);
          }
        }

        @keyframes faceScanning {
          0%, 100% {
            transform:
              scale(0.98)
              rotateX(0deg);
          }

          50% {
            transform:
              scale(1.015)
              rotateX(2deg);
          }
        }

        @keyframes identityPulse {
          0%, 100% {
            box-shadow:
              0 40px 100px
              rgba(0,0,0,0.55),
              0 0 55px
              rgba(56,189,248,0.10),
              inset 0 1px 0
              rgba(255,255,255,0.08);
          }

          50% {
            box-shadow:
              0 40px 100px
              rgba(0,0,0,0.55),
              0 0 100px
              rgba(56,189,248,0.28),
              inset 0 1px 0
              rgba(255,255,255,0.08);
          }
        }

        @keyframes identityRing {
          0% {
            transform:
              rotate(0deg)
              scale(0.95);
          }

          50% {
            transform:
              rotate(180deg)
              scale(1.03);
          }

          100% {
            transform:
              rotate(360deg)
              scale(0.95);
          }
        }

        @keyframes identityFace {
          0%, 100% {
            transform:
              scale(0.99);
          }

          50% {
            transform:
              scale(1.025);
          }
        }

        @keyframes identityEyes {
          0%, 100% {
            transform:
              translateX(-2px);
          }

          25% {
            transform:
              translateX(3px);
          }

          50% {
            transform:
              translateX(0)
              scale(1.08);
          }

          75% {
            transform:
              translateX(-3px);
          }
        }

        @keyframes mouthCode {
          0%, 100% {
            transform:
              scaleX(0.85);
          }

          50% {
            transform:
              scaleX(1.15);
          }
        }

        @keyframes mouthIdentity {
          0%, 100% {
            transform:
              scale(0.8);
          }

          50% {
            transform:
              scale(1.15);
          }
        }

        @keyframes identityPulseStrong {
          0%, 100% {
            box-shadow:
              0 40px 100px
              rgba(0,0,0,0.55),
              0 0 60px
              rgba(56,189,248,0.18),
              0 0 110px
              rgba(56,189,248,0.08);
          }

          50% {
            box-shadow:
              0 40px 100px
              rgba(0,0,0,0.55),
              0 0 100px
              rgba(56,189,248,0.40),
              0 0 150px
              rgba(56,189,248,0.15);
          }
        }

        @keyframes verifyingFace {
          0%, 100% {
            transform:
              scale(1.02)
              rotateY(-2deg);
          }

          50% {
            transform:
              scale(1.07)
              rotateY(2deg);
          }
        }

        @keyframes verifyingEyes {
          0% {
            transform:
              translateX(-6px);
          }

          50% {
            transform:
              translateX(6px);
          }

          100% {
            transform:
              translateX(-6px);
          }
        }

        /* =====================================================
           ANIMACIONES CÁMARA
        ===================================================== */

        @keyframes scan {
          0% {
            top: 18px;
          }

          50% {
            top:
              calc(100% - 20px);
          }

          100% {
            top: 18px;
          }
        }

        @keyframes spin {
          to {
            transform:
              rotate(360deg);
          }
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 900px) {

          .login-visual {
            display: none;
          }

          .login-form-panel {
            width: 100%;

            padding:
              35px 25px;
          }

          .form-brand {
            display: flex;

            align-items: center;

            gap: 9px;

            color: #0f172a;

            font-size: 14px;

            font-weight: 800;

            margin-bottom: 40px;
          }

          .form-brand-icon {
            width: 30px;
            height: 30px;

            border-radius: 8px;

            background: #0f172a;

            color: white;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 10px;
          }
        }

        @media (max-width: 500px) {

          .login-form-panel {
            padding:
              25px 20px;
          }

          .form-title {
            font-size: 29px;
          }

          .otp-input {
            letter-spacing: 6px;
          }
        }

      `}</style>

      <div
        className="login-page"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >

        {/* ======================================================
            PANEL IZQUIERDO
        ====================================================== */}

        <section className="login-visual">

          <div className="visual-grid" />

          <div className="brand-mini">
            <div className="brand-mini-icon">
              EI
            </div>

            Empresa Inteligente
          </div>

          <div className="visual-content">

            <div className="mascot-area">

              <div className="mascot-glow" />

              {/* =================================================
                  PERSONAJE
              ================================================= */}

              <div
                className={`
                  mascot-shell
                  mascot-${step}
                  ${activeField === "password"
                    ? "mascot-password"
                    : ""}
                  ${verifyingFace
                    ? "mascot-verifying"
                    : ""}
                `}
              >

                <div
                  className="mascot-face"
                  style={{
                    transform:
                      step === "identity"
                        ? "scale(1.04)"
                        : "scale(1)",
                  }}
                >

                  {/* OJO IZQUIERDO */}

                  <div
                    className="eye"
                    style={{
                      height:
                        activeField === "password"
                          ? "12px"
                          : step === "code"
                          ? "43px"
                          : step === "identity"
                          ? "48px"
                          : "54px",

                      marginTop:
                        activeField === "password"
                          ? "18px"
                          : step === "code"
                          ? "2px"
                          : "0",
                    }}
                  >
                    <div
                      className="pupil"
                      style={pupilStyle}
                    />
                  </div>

                  {/* OJO DERECHO */}

                  <div
                    className="eye"
                    style={{
                      height:
                        activeField === "password"
                          ? "12px"
                          : step === "code"
                          ? "43px"
                          : step === "identity"
                          ? "48px"
                          : "54px",

                      marginTop:
                        activeField === "password"
                          ? "18px"
                          : step === "code"
                          ? "2px"
                          : "0",
                    }}
                  >
                    <div
                      className="pupil"
                      style={pupilStyle}
                    />
                  </div>

                  <div className="mascot-mouth" />

                </div>
              </div>

              {/* =================================================
                  ESTADO
              ================================================= */}

              <div className="mascot-status">

                {step === "access" &&
                  "Sistema inteligente"}

                {step === "code" &&
                  "Verificación de acceso"}

                {step === "identity" &&
                  "Validación de identidad"}

              </div>

              <div className="visual-title">
                Empresa Inteligente
              </div>

              <p className="visual-description">
                Plataforma empresarial diseñada para
                centralizar información, análisis y
                gestión inteligente.
              </p>

            </div>
          </div>

          <div className="visual-footer">
            <span>
              EMPRESA INTELIGENTE
            </span>

            <span>
              2026
            </span>
          </div>

        </section>

        {/* ======================================================
            PANEL DERECHO
        ====================================================== */}

        <section className="login-form-panel">

          <div className="login-form-container">

            {/* Marca móvil */}

            <div className="form-brand">

              <div className="form-brand-icon">
                EI
              </div>

              Empresa Inteligente

            </div>

            {/* ==================================================
                PASO 1
            ================================================== */}

            {step === "access" && (
              <>

                <div className="step-header">

                  <div className="step-dot active" />
                  <div className="step-dot" />
                  <div className="step-dot" />

                  <span className="step-text">
                    ACCESO
                  </span>

                </div>

                <div className="form-kicker">
                  Acceso empresarial
                </div>

                <h1 className="form-title">
                  Bienvenido
                  <br />
                  de nuevo.
                </h1>

                <p className="form-description">
                  Ingresa tus credenciales para
                  acceder al sistema empresarial.
                </p>

                {error && (
                  <div className="error-box">
                    ⚠️ {error}
                  </div>
                )}

                <form
                  onSubmit={
                    handleAccessSubmit
                  }
                >

                  {/* CORREO */}

                  <div className="input-group">

                    <label className="input-label">
                      Correo electrónico
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        @
                      </span>

                      <input
                        className="login-input"
                        type="email"
                        required
                        placeholder="nombre@empresa.com"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        onFocus={() =>
                          setActiveField(
                            "email"
                          )
                        }
                        onBlur={() =>
                          setActiveField(null)
                        }
                      />

                    </div>
                  </div>

                  {/* CONTRASEÑA */}

                  <div className="input-group">

                    <label className="input-label">
                      Contraseña
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ●
                      </span>

                      <input
                        className="login-input"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                        onFocus={() =>
                          setActiveField(
                            "password"
                          )
                        }
                        onBlur={() =>
                          setActiveField(null)
                        }
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {showPassword
                          ? "Ocultar"
                          : "Mostrar"}
                      </button>

                    </div>
                  </div>

                  <div className="form-options">

                    <label className="remember">

                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) =>
                          setRememberMe(
                            e.target.checked
                          )
                        }
                      />

                      Recordarme

                    </label>

                    <button
                      type="button"
                      className="forgot"
                      onClick={() =>
                        alert(
                          "Contacta a administración de TI."
                        )
                      }
                    >
                      ¿Olvidaste tu contraseña?
                    </button>

                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="main-button"
                    style={buttonStyle}
                  >
                    {loading
                      ? "Validando..."
                      : "Continuar →"}
                  </button>

                </form>

                <div className="register-line">

                  ¿No tienes una cuenta?{" "}

                  <button
                    type="button"
                    className="register-button"
                    onClick={onRegister}
                  >
                    Solicita tu acceso
                  </button>

                </div>

              </>
            )}

            {/* ==================================================
                PASO 2 — OTP
            ================================================== */}

            {step === "code" && (
              <>

                <div className="step-header">

                  <div className="step-dot active" />
                  <div className="step-dot active" />
                  <div className="step-dot" />

                  <span className="step-text">
                    VERIFICACIÓN
                  </span>

                </div>

                <div className="form-kicker">
                  Segundo factor
                </div>

                <h1 className="form-title">
                  Confirma tu
                  <br />
                  identidad.
                </h1>

                <p className="form-description">
                  Hemos enviado un código de
                  verificación a:
                  <br />

                  <strong>
                    {email}
                  </strong>
                </p>

                {error && (
                  <div className="error-box">
                    ⚠️ {error}
                  </div>
                )}

                <form
                  onSubmit={
                    handleCodeSubmit
                  }
                >

                  <input
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="••••••"
                    value={token}
                    onChange={(e) =>
                      setToken(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="main-button"
                    style={buttonStyle}
                  >
                    {loading
                      ? "Verificando..."
                      : "Verificar código →"}
                  </button>

                  <div className="resend">

                    {canResend ? (
                      <>
                        ¿No recibiste el código?{" "}

                        <button
                          type="button"
                          className="resend-button"
                          onClick={
                            handleResendOtp
                          }
                        >
                          Reenviar código
                        </button>
                      </>
                    ) : (
                      <>
                        Puedes solicitar otro código
                        en{" "}

                        <strong>
                          {resendTimer}s
                        </strong>
                      </>
                    )}

                  </div>

                  <button
                    type="button"
                    className="back-button"
                    onClick={() => {
                      setStep("access");
                      setToken("");
                      setError(null);
                    }}
                  >
                    ← Volver al acceso
                  </button>

                </form>

              </>
            )}

            {/* ==================================================
                PASO 3 — IDENTIDAD
            ================================================== */}

            {step === "identity" && (
              <>
                <div className="step-header">

                  <div className="step-dot active" />
                  <div className="step-dot active" />
                  <div className="step-dot active" />

                  <span className="step-text">
                    IDENTIDAD
                  </span>

                </div>

                <div className="form-kicker">
                  Verificación final
                </div>

                <h1 className="form-title">
                  Confirma tu
                  <br />
                  identidad.
                </h1>

                <p className="form-description">
                  Completa la prueba de vida facial
                  para continuar con la verificación.
                </p>

                {error && (
                  <div className="error-box">
                    ⚠️ {error}
                  </div>
                )}

                {/* Pantalla inicial */}
                {!livenessSessionId &&
                  !livenessCompleted && (
                    <div className="camera-box">
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          minHeight: "260px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                          textAlign: "center",
                          padding: "28px",
                          color: "white",
                          background:
                            "radial-gradient(circle at 50% 40%, #162033 0%, #050608 70%)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "48px",
                            marginBottom: "14px",
                          }}
                        >
                          🔐
                        </div>

                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            marginBottom: "8px",
                          }}
                        >
                          Verificación facial segura
                        </div>

                        <div
                          style={{
                            maxWidth: "330px",
                            color: "#94a3b8",
                            fontSize: "12px",
                            lineHeight: 1.6,
                          }}
                        >
                          Utilizaremos tu cámara para
                          realizar una prueba de vida y
                          comprobar que hay una persona
                          real frente al dispositivo.
                        </div>
                      </div>
                    </div>
                  )}

                {/* Face Liveness real de AWS */}
                {livenessSessionId &&
                  !livenessCompleted && (
                    <div
                      style={{
                        width: "100%",
                        marginBottom: "20px",
                        borderRadius: "18px",
                        overflow: "hidden",
                        border: "1px solid #1e293b",
                        background: "#050608",
                      }}
                    >
                      <FaceLivenessDetector
                        sessionId={livenessSessionId}
                        region="us-east-1"
                        onAnalysisComplete={
                          handleLivenessComplete
                        }
                        onError={(livenessError) => {
                          console.error(
                            "Error de Face Liveness:",
                            livenessError
                          );

                          setLivenessSessionId(null);
                          setLivenessCompleted(false);
                          setVerifyingFace(false);

                          setError(
                            "No se pudo completar la prueba de vida. Inténtalo nuevamente."
                          );
                        }}
                      />
                    </div>
                  )}

                {/* Resultado de Liveness */}
                {livenessCompleted && (
                  <div
                    style={{
                      width: "100%",
                      minHeight: "180px",
                      borderRadius: "18px",
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      textAlign: "center",
                      padding: "24px",
                      background:
                        "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
                      border:
                        "1px solid #bbf7d0",
                      color: "#166534",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "42px",
                        marginBottom: "8px",
                      }}
                    >
                      ✓
                    </div>

                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        marginBottom: "6px",
                      }}
                    >
                      {identityResult === "enrolled"
                        ? "Rostro registrado correctamente"
                        : "Identidad confirmada"}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        lineHeight: 1.5,
                        maxWidth: "320px",
                      }}
                    >
                      {identityResult === "enrolled"
                        ? "Tu rostro quedó vinculado a tu cuenta. A partir del próximo acceso deberá coincidir contigo."
                        : "La prueba de vida y la identidad facial fueron verificadas correctamente."}
                    </div>
                  </div>
                )}

                {/* Iniciar / repetir Liveness */}
                {!livenessSessionId &&
                  !livenessCompleted && (
                    <button
                      type="button"
                      disabled={livenessLoading}
                      onClick={createLivenessSession}
                      className="main-button"
                      style={{
                        ...buttonStyle,
                        opacity:
                          livenessLoading
                            ? 0.55
                            : 1,
                      }}
                    >
                      {livenessLoading
                        ? "Preparando cámara..."
                        : "Iniciar verificación facial →"}
                    </button>
                  )}

                {livenessCompleted && (
                  <button
                    type="button"
                    disabled={true}
                    className="main-button"
                    style={{
                      ...buttonStyle,
                      background: "#16a34a",
                      opacity: 0.75,
                      cursor: "default",
                    }}
                  >
                    Acceso facial autorizado ✓
                  </button>
                )}

                <button
                  type="button"
                  className="back-button"
                  disabled={livenessLoading}
                  onClick={() => {
                    setLivenessSessionId(null);
                    setLivenessLoading(false);
                    setLivenessCompleted(false);
                    setIdentityResult(null);
                    setVerifyingFace(false);
                    setStep("code");
                    setError(null);
                  }}
                >
                  ← Volver al código
                </button>

              </>
            )}

            <div className="security-line">

              <span>●</span>

              Conexión segura

              <span>•</span>

              Empresa Inteligente 2026

            </div>

          </div>

        </section>

      </div>
    </>
  );
}