import { useAuthContext } from "src/contexts/auth-context";

const useRefreshToken = () => {
    const { refreshToken } = useAuthContext(); // ✅ Get the helper function from context

    // Simply return the refresh function from context
    return refreshToken;
};

export default useRefreshToken;