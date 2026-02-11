import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_ADMIN_EMAIL = "afiliadosprobusiness@gmail.com";

/**
 * Redirige al panel admin cuando el correo o el rol corresponde a superadmin.
 */
export const useAdminRedirect = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const configuredAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || "").trim().toLowerCase();

  useEffect(() => {
    if (loading) return;

    const email = (user?.email || userProfile?.email || "").trim().toLowerCase();
    const isAdminByRole = userProfile?.role === "ADMIN";
    const isAdminByEmail = !!email && [configuredAdminEmail, DEFAULT_ADMIN_EMAIL].includes(email);
    const isAdmin = isAdminByRole || isAdminByEmail;

    if (isAdmin && window.location.pathname === "/dashboard") {
      navigate("/dashboard/admin", { replace: true });
    }
  }, [user, userProfile, loading, navigate, configuredAdminEmail]);
};

