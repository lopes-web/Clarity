import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
}

export default ProtectedRoute; 