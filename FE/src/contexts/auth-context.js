import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import PropTypes from "prop-types";
import axios from "src/api/axios";
import { API } from "src/api";

// ✅ Fixed: Removed duplicate UPDATE_USER key
const HANDLERS = {
  INITIALIZE: "INITIALIZE",
  SIGN_IN: "SIGN_IN",
  SIGN_OUT: "SIGN_OUT",
  UPDATE_USER: "UPDATE_USER",
  UPDATE_TOKEN: "UPDATE_TOKEN",
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

const handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      ...(user
        ? {
            isAuthenticated: true,
            isLoading: false,
            user,
          }
        : {
            isLoading: false,
          }),
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const user = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  [HANDLERS.UPDATE_USER]: (state, action) => {
    const user = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  [HANDLERS.UPDATE_TOKEN]: (state, action) => {
    const accessToken = action.payload;
    console.log("🔄 Updating access token");
    return {
      ...state,
      user: { ...state.user, accessToken },
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  },
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

export const AuthContext = createContext({ undefined });

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  const initialize = async () => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    let isAuthenticated = false;

    try {
      isAuthenticated = window.sessionStorage.getItem("authenticated") === "true";
    } catch (err) {
      console.error(err);
    }

    dispatch({
      type: HANDLERS.INITIALIZE,
    });
  };

  useEffect(() => {
    initialize();
  }, []);

  const signIn = async (email, password) => {
    let userdetails;
    try {
      const response = await axios.post(
        "/users/login",
        { email: email, password },
        { withCredentials: true }
      );
      console.log(response.data);
      userdetails = response.data.data;
      if (response.error) {
        return response.errors[0];
      }
      window.sessionStorage.setItem("authenticated", "true");
    } catch (error) {
      return error;
    }

    const user = {
      id: userdetails.id,
      email: userdetails.email,
      name: userdetails.username,
      userID: userdetails.userId,
      accessToken: userdetails.accessToken,
      avatar:
        "https://images.unsplash.com/photo-1554067559-269708c83fb6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=794&q=80",
      roles: userdetails.role,
      lastLogin: userdetails.lastLogin,
      firstName: userdetails.firstName,
      lastName: userdetails.lastName,
      DOB: userdetails.DOB,
      gender: userdetails.gender,
      mobileNo: userdetails.mobileNo,
      pincode: userdetails.pincode,
      state: userdetails.state,
      address: userdetails.address,
      organisation: userdetails.organisation,
      referenceEmail: userdetails.referenceEmail,
      isEnabled: userdetails.isEnabled,
      provider: userdetails.provider,
    };

    localStorage.setItem("provider", "local");
    dispatch({
      type: HANDLERS.SIGN_IN,
      payload: user,
    });
    return { result: true, role: userdetails.role };
  };

  const roleSignUp = async (values, photo) => {
    let response;
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value);
    }
    formData.append("file", photo);

    try {
      const token = state.user?.accessToken;

      if (!token) {
        console.error("Access token missing: cannot register role user");
        return {
          success: false,
          errors: ["Unauthorized: No token found"],
          data: null,
        };
      }

      response = await axios.post("/users/roleregister", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
    } catch (error) {
      return error;
    }
    return response;
  };

  const signUp = async (values, photo) => {
    let response;
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value);
    }
    formData.append("file", photo);

    try {
      response = await axios.post("/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      return error;
    }
    return response;
  };

  const signOut = async (token) => {
    localStorage.removeItem("provider");
    localStorage.removeItem("userContext");
    console.log("Logging out with token", token);

    const apiInstance = axios.create({
      baseURL: `${API}`,
      timeout: 5000,
    });

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await apiInstance.get(`/users/logout`, {
        withCredentials: true,
        headers,
      });
      console.log("User logged out", response.data);
      window.sessionStorage.setItem("authenticated", "false");
    } catch (error) {
      console.error("Logout error:", error);
    }

    dispatch({
      type: HANDLERS.SIGN_OUT,
    });
  };

  // ✅ Helper function to refresh token (not a hook)
  const refreshToken = async () => {
    try {
      console.log('🔄 Attempting to refresh token...');
      
      const response = await axios.get('/users/token/refresh', {
        withCredentials: true,
      });

      const newAccessToken = response.data.data.newAccessToken;

      // Update context with new token
      dispatch({
        type: HANDLERS.UPDATE_TOKEN,
        payload: newAccessToken,
      });

      console.log('✅ Token refreshed successfully');
      return newAccessToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      // If refresh fails, log out
      dispatch({ type: HANDLERS.SIGN_OUT });
      window.sessionStorage.removeItem('authenticated');
      
      throw error;
    }
  };

  // ✅ Simplified verifyUser without hooks
  const verifyUser = async (token) => {
    try {
      let userdetails;
      let response;
  
      // First attempt with token or refresh cookie
      try {
        if (token != null) {
          response = await axios.get(`/users`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
        } else {
          response = await axios.get(`/users`, { withCredentials: true });
        }
  
        userdetails = response.data.data;
        console.log('User details from /users:', userdetails); // DEBUG
      } catch (error) {
        console.log("Verification failed, attempting token refresh");
        
        // Refresh token first
        const newAccessToken = await refreshToken();
        
        // Retry with new token
        response = await axios.get(`/users`, {
          headers: { Authorization: `Bearer ${newAccessToken}` },
          withCredentials: true,
        });
        userdetails = response.data.data;
      }
  
      // ✅ CRITICAL: Ensure all required fields exist with fallbacks
      const user = {
        id: userdetails?.id, // Try multiple ID fields
        email: userdetails?.email,
        name: userdetails?.username || userdetails?.name,
        userID: userdetails?.userId,
        accessToken: userdetails?.accessToken || response.data.data?.accessToken,
        avatar: "https://images.unsplash.com/photo-1554067559-269708c83fb6...", // default
        roles: userdetails?.role || userdetails?.roles,
        lastLogin: userdetails?.lastLogin,
        firstName: userdetails?.firstName,
        lastName: userdetails?.lastName,
        DOB: userdetails?.DOB,
        gender: userdetails?.gender,
        mobileNo: userdetails?.mobileNo,
        pincode: userdetails?.pincode,
        state: userdetails?.state,
        address: userdetails?.address,
        organisation: userdetails?.organisation,
        referenceEmail: userdetails?.referenceEmail,
        isEnabled: userdetails?.isEnabled,
        provider: userdetails?.provider,
      };
  
      // ✅ VALIDATE: Ensure critical fields exist
      if (!user.id) {
        console.error('❌ No user ID found in response:', userdetails);
        throw new Error('User ID missing from server response');
      }
  
      console.log('✅ Created user object with ID:', user.id); // DEBUG
  
      window.sessionStorage.setItem("authenticated", "true");
      dispatch({ type: HANDLERS.SIGN_IN, payload: user });
  
      return { message: "User verified successfully", result: true };
    } catch (error) {
      console.error("❌ Final verification failed:", error);
      window.sessionStorage.removeItem("authenticated");
      dispatch({ type: HANDLERS.SIGN_OUT });
      return { message: "Authentication failed", result: false };
    }
  };
  

  // ✅ Function to update token
  const updateToken = (newAccessToken) => {
    dispatch({
      type: HANDLERS.UPDATE_TOKEN,
      payload: newAccessToken,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        dispatch, // ✅ Expose dispatch for hooks
        roleSignUp,
        signIn,
        signUp,
        signOut,
        verifyUser,
        updateToken,
        refreshToken, // ✅ Expose helper function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);