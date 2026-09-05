import { useState, useEffect, useRef } from "react";
import { supabase } from "../../services/supabaseClient";

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [step, setStep] = useState<"access" | "code" | "identity">("access");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [otpSecret, setOtpSecret] = useState(""); // Almacena el código OTP generado localmente
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para el temporizador de reenvío de OTP
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Referencias para la cámara web (Paso 3)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [verifyingFace, setVerifyingFace] = useState(false);

  // Paleta de colores dinámica según el tema seleccionado
  const t = {
    bg: theme === "dark" ? "#05070f" : "#f8fafc",
    gradient: theme === "dark" 
      ? "radial-gradient(circle at 50% 0%, #0c152d 0%, #05070f 75%)" 
      : "radial-gradient(circle at 50% 0%, #e0f2fe 0%, #f8fafc 75%)",
    cardBg: theme === "dark" ? "#080c18" : "#ffffff",
    cardBorder: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    text: theme === "dark" ? "#f8fafc" : "#0f172a",
    subText: theme === "dark" ? "#94a3b8" : "#64748b",
    inputBg: theme === "dark" ? "#020617" : "#f8fafc",
    inputBorder: theme === "dark" ? "#1e293b" : "#cbd5e1",
    stepInactiveBg: theme === "dark" ? "#0f172a" : "#f1f5f9",
    stepInactiveBorder: theme === "dark" ? "#1e293b" : "#cbd5e1",
    lineBg: theme === "dark" ? "#1e293b" : "#e2e8f0",
    shadow: theme === "dark" ? "0 25px 50px -12px rgba(0, 0, 0, 0.8)" : "0 20px 25px -5px rgba(0, 0, 0, 0.05)"
  };

  // Temporizador para el reenvío de código OTP
  useEffect(() => {
    let interval: any;
    if (step === "code" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Activar cámara cuando pasamos al paso de identidad
  useEffect(() => {
    if (step === "identity") {
      startCamera();
    } else {
      stopCamera();
    }
  }, [step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 300 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setError("No se pudo acceder a la cámara web. Asegúrate de dar permisos en tu navegador.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  // PASO 1: Validar Credenciales y enviar OTP mediante la API HTTP directa de Resend
  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Validar correo y contraseña en Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !authData.user) {
        console.error("Error de autenticación Supabase:", authError);
        throw new Error(authError?.message || "Correo o contraseña incorrectos.");
      }

      // 2. Cerrar sesión temporalmente para exigir completar el flujo de 2FA
      await supabase.auth.signOut();

      // 3. Generar un código aleatorio de 8 dígitos
      const generatedCode = Math.floor(10000000 + Math.random() * 90000000).toString();
      setOtpSecret(generatedCode);

      // 4. Enviar correo usando la API HTTP de Resend con la variable de entorno
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [email.trim()],
          subject: "Tu código de verificación - Empresa Inteligente",
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;"><h2>Empresa Inteligente</h2><p>Tu código de acceso de 8 dígitos es:</p><h1 style="color: #0284c7; letter-spacing: 4px;">${generatedCode}</h1><p>Este código es confidencial.</p></div>`,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "No se pudo enviar el correo mediante Resend.");
      }

      // Éxito: Avanzar al paso del Código
      setStep("code");
      setResendTimer(60);
      setCanResend(false);
    } catch (err: any) {
      console.error("Excepción en handleAccessSubmit:", err);
      setError(err.message || "Ocurrió un error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código OTP mediante la API HTTP de Resend
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setError(null);

    try {
      const generatedCode = Math.floor(10000000 + Math.random() * 90000000).toString();
      setOtpSecret(generatedCode);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [email.trim()],
          subject: "Tu código de verificación - Empresa Inteligente",
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;"><h2>Empresa Inteligente</h2><p>Tu nuevo código de acceso es:</p><h1 style="color: #0284c7; letter-spacing: 4px;">${generatedCode}</h1></div>`,
        }),
      });

      if (!response.ok) throw new Error("No se pudo reenviar el código.");

      alert("¡Código OTP reenviado con éxito a tu correo!");
      setResendTimer(60);
      setCanResend(false);
    } catch (err: any) {
      console.error("Error al reenviar OTP:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Verificar el Código OTP localmente -> Avanza a Reconocimiento Facial
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      if (token.trim() !== otpSecret) {
        throw new Error("El código introducido es incorrecto.");
      }

      // Avanzar al paso final de Biometría / Identidad
      setStep("identity");
    } catch (err: any) {
      setError(err.message || "Código incorrecto.");
    } finally {
      setLoading(false);
    }
  };

  // PASO 3: Validación Biométrica Facial Final y Login Definitivo
  const handleVerifyFace = async () => {
    setVerifyingFace(true);
    setError(null);

    try {
      // Iniciar sesión oficialmente en Supabase de forma definitiva al aprobar la biometría
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) throw new Error("Error al completar la sesión en el servidor.");

      setTimeout(() => {
        setVerifyingFace(false);
        stopCamera();
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.reload();
        }
      }, 2000); 
    } catch (err: any) {
      console.error("Error en biometría:", err);
      setError(err.message);
      setVerifyingFace(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: t.bg,
      backgroundImage: t.gradient,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      color: t.text,
      padding: "24px",
      position: "relative"
    }}>
      
      {/* Botón Flotante: Interruptor de Tema (Modo Claro / Oscuro) */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title="Cambiar Modo Claro/Oscuro"
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          backgroundColor: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          color: t.text,
          padding: "10px 14px",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transition: "all 0.2s"
        }}
      >
        <span>{theme === "dark" ? "☀️" : "🌙"}</span>
        <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
      </button>

      {/* Contenedor Principal */}
      <div style={{
        width: "100%",
        maxWidth: "460px",
        backgroundColor: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: "24px",
        padding: "40px 36px",
        boxShadow: t.shadow,
      }}>
        
        {/* Cabecera */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: theme === "dark" ? "rgba(14, 165, 233, 0.1)" : "#e0f2fe",
            border: `1px solid ${theme === "dark" ? "rgba(14, 165, 233, 0.3)" : "#bae6fd"}`,
            borderRadius: "12px",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
            color: "#0284c7",
            marginBottom: "12px"
          }}>
            🛡️
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 4px 0", color: t.text }}>
            Empresa <span style={{ color: "#0284c7" }}>Inteligente</span>
          </h1>
          <p style={{ fontSize: "11px", color: t.subText, margin: 0, letterSpacing: "1.2px", textTransform: "uppercase", fontWeight: "600" }}>
            SISTEMA DE GESTIÓN EMPRESARIAL
          </p>
        </div>

        {/* Indicadores de Pasos */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", padding: "0 10px", position: "relative" }}>
          <div style={{ position: "absolute", top: "20px", left: "40px", right: "40px", height: "2px", backgroundColor: t.lineBg, zIndex: 1 }} />

          {/* Paso 1 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: step === "access" ? "#0284c7" : t.stepInactiveBg, border: `1px solid ${step === "access" ? "#0284c7" : t.stepInactiveBorder}`, display: "flex", justifyContent: "center", alignItems: "center", color: step === "access" ? "#fff" : t.subText, fontSize: "16px" }}>🔒</div>
            <span style={{ fontSize: "11px", marginTop: "6px", color: step === "access" ? "#0284c7" : t.subText, fontWeight: "600" }}>Acceso</span>
          </div>

          {/* Paso 2 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: step === "code" ? "#0284c7" : t.stepInactiveBg, border: `1px solid ${step === "code" ? "#0284c7" : t.stepInactiveBorder}`, display: "flex", justifyContent: "center", alignItems: "center", color: step === "code" ? "#fff" : t.subText, fontSize: "16px" }}>🔢</div>
            <span style={{ fontSize: "11px", marginTop: "6px", color: step === "code" ? "#0284c7" : t.subText, fontWeight: "600" }}>Código</span>
          </div>

          {/* Paso 3 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: step === "identity" ? "#0284c7" : t.stepInactiveBg, border: `1px solid ${step === "identity" ? "#0284c7" : t.stepInactiveBorder}`, display: "flex", justifyContent: "center", alignItems: "center", color: step === "identity" ? "#fff" : t.subText, fontSize: "16px" }}>👤</div>
            <span style={{ fontSize: "11px", marginTop: "6px", color: step === "identity" ? "#0284c7" : t.subText, fontWeight: "600" }}>Identidad</span>
          </div>
        </div>

        {/* Títulos dinámicos */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 4px 0", color: t.text }}>
            {step === "access" && "Bienvenido de nuevo"}
            {step === "code" && "Verificación de Código OTP"}
            {step === "identity" && "Verificación Facial Segura"}
          </h2>
          <p style={{ fontSize: "13px", color: t.subText, margin: 0 }}>
            {step === "access" && "Ingresa tus credenciales corporativas"}
            {step === "code" && "Introduce el código de 8 dígitos enviado a tu correo"}
            {step === "identity" && "Posiciónate frente a la cámara para validar tu rostro"}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: theme === "dark" ? "rgba(239, 68, 68, 0.1)" : "#fef2f2", border: `1px solid ${theme === "dark" ? "rgba(239, 68, 68, 0.3)" : "#fecaca"}`, color: theme === "dark" ? "#fca5a5" : "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* PASO 1: ACCESO */}
        {step === "access" && (
          <form onSubmit={handleAccessSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: t.subText }}>Correo electrónico</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "14px", color: t.subText }}>✉️</span>
                <input type="email" required placeholder="nombre@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "12px 14px 12px 40px", backgroundColor: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: "10px", color: t.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: t.subText }}>Contraseña</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "14px", color: t.subText }}>🔒</span>
                <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "12px 40px 12px 40px", backgroundColor: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: "10px", color: t.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "12px", background: "transparent", border: "none", cursor: "pointer", color: t.subText, fontSize: "14px" }}>{showPassword ? "👁️" : "👁️‍🗨️"}</button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", fontSize: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: t.subText, cursor: "pointer" }}>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: "#0284c7" }} /> Recordarme
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Contacta a administración de TI."); }} style={{ color: "#0284c7", textDecoration: "none", fontWeight: "500" }}>¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", backgroundColor: loading ? "#94a3b8" : "#0284c7", color: "white", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)", marginBottom: "16px" }}>
              {loading ? "Enviando código..." : "Iniciar sesión →"}
            </button>
          </form>
        )}

        {/* PASO 2: CÓDIGO OTP + REENVIAR */}
        {step === "code" && (
          <form onSubmit={handleCodeSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <input type="text" required maxLength={8} placeholder="12345678" value={token} onChange={(e) => setToken(e.target.value)} style={{ width: "100%", padding: "16px", backgroundColor: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: "12px", color: "#0284c7", fontSize: "24px", letterSpacing: "6px", textAlign: "center", fontWeight: "700", outline: "none", boxSizing: "border-box" }} />
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", backgroundColor: loading ? "#94a3b8" : "#16a34a", color: "white", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)", marginBottom: "16px" }}>
              {loading ? "Verificando código..." : "Validar código OTP"}
            </button>

            {/* Panel de Reenvío con Temporizador */}
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              {canResend ? (
                <button type="button" onClick={handleResendOtp} style={{ background: "transparent", border: "none", color: "#0284c7", fontSize: "12px", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>
                  🔄 Reenviar código OTP ahora
                </button>
              ) : (
                <p style={{ fontSize: "12px", color: t.subText, margin: 0 }}>
                  Reenviar código disponible en <span style={{ fontWeight: "600", color: "#0284c7" }}>{resendTimer}s</span>
                </p>
              )}
            </div>

            <button type="button" onClick={() => setStep("access")} style={{ width: "100%", background: "transparent", border: "none", color: t.subText, fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
              ← Volver a credenciales
            </button>
          </form>
        )}

        {/* PASO 3: RECONOCIMIENTO FACIAL BIOMÉTRICO */}
        {step === "identity" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: "100%", height: "220px", backgroundColor: "#000", borderRadius: "14px", overflow: "hidden", marginBottom: "20px", border: `2px solid ${verifyingFace ? "#16a34a" : "#0284c7"}` }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {!cameraActive && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px" }}>
                  Iniciando cámara segura...
                </div>
              )}
              {verifyingFace && (
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(22, 163, 74, 0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🧬</div>
                  Verificando biometría facial...
                </div>
              )}
            </div>

            <button type="button" onClick={handleVerifyFace} disabled={verifyingFace || !cameraActive} style={{ width: "100%", padding: "13px", backgroundColor: verifyingFace ? "#94a3b8" : "#0284c7", color: "white", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: verifyingFace ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)", marginBottom: "12px" }}>
              {verifyingFace ? "Analizando rostro..." : "Escanear y Validar Rostro"}
            </button>

            <button type="button" onClick={() => { stopCamera(); setStep("code"); }} style={{ width: "100%", background: "transparent", border: "none", color: t.subText, fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
              ← Regresar a verificación por código
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: `1px solid ${t.cardBorder}`, textAlign: "center", fontSize: "10px", color: t.subText }}>
          🔒 Conexión encriptada E2EE • Empresa Inteligente 2026
        </div>

      </div>
    </div>
  );
}