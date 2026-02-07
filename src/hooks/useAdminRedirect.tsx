import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook para redirigir automáticamente al panel de admin si el usuario es administrador
 */
export const useAdminRedirect = () => {
    const { userProfile, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && userProfile) {
            // Si el usuario es admin y está en el dashboard normal, redirigir a admin
            if (userProfile.role === 'ADMIN' && window.location.pathname === '/dashboard') {
                navigate('/dashboard/admin', { replace: true });
            }
        }
    }, [userProfile, loading, navigate]);
};
