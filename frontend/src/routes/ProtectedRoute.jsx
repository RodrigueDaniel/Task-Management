import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";

const ProtectedRoute = ({ children }) => {
    const [isAuth, setAuth] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.post("/auth/refresh");
                setAuth(true);
            } catch {
                setAuth(false);
            }
        }
        checkAuth();
    }, []);

    if(isAuth === null) return <p>Loading...</p>;

    return isAuth ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;