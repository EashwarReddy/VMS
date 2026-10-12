import { axiosPrivate } from "src/api/axios";
import { useEffect } from "react";
import { useAuthContext } from "src/contexts/auth-context";
import useRefreshToken from "./useRefreshToken";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { user } = useAuthContext(); // ✅ Get user directly from context
    
    useEffect(() => {
        // ✅ Request interceptor: Add token to all requests
        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {
                if (!config.headers['Authorization']) {
                    const token = user?.accessToken;
                    if (token) {
                        config.headers['Authorization'] = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // ✅ Response interceptor: Auto-refresh on 401 or 403
        const responseIntercept = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error?.config;

                // ✅ Check for both 401 AND 403 status codes
                if (
                    (error?.response?.status === 401 || error?.response?.status === 403) &&
                    !prevRequest?.sent
                ) {
                    console.log('🔄 Token expired, attempting refresh...');
                    prevRequest.sent = true; // Prevent infinite loop

                    try {
                        // ✅ Get new access token (this updates context automatically)
                        const newAccessToken = await refresh();

                        // ✅ Update the failed request with new token
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                        // ✅ Retry the original request
                        return axiosPrivate(prevRequest);

                    } catch (refreshError) {
                        // ✅ Refresh failed - user will be logged out by useRefreshToken
                        console.error('💀 Token refresh failed, user logged out');
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        // Cleanup interceptors on unmount
        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        };
    }, [user?.accessToken, refresh]); // ✅ Re-run when token changes

    return axiosPrivate;
};

export default useAxiosPrivate;