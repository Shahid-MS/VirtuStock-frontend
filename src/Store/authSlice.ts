import apiClient from "@/API/ApiClient";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  name?: string;
  email?: string;
  roles: string[];
  profilePicUrl?: string;
  authInitialized: boolean;
}

interface DecodedToken {
  sub: string;
  name: string;
  roles: string[];
  exp: number;
  profilePicUrl: string;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  name: undefined,
  email: undefined,
  roles: [],
  profilePicUrl: undefined,
  authInitialized: false,
};

export const useAuthInit = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("virtustock-token");
      if (!token) {
        // Logged-out visitor: nothing to restore, but protected routes must
        // still be told that auth initialisation has finished.
        dispatch(authInitialized());
        return;
      }
      try {
        const refreshRes = await apiClient.post("/user/refresh-token", null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          skipErrorToast: true,
        });
        const newToken = refreshRes.data["virtustock-token"];
        dispatch(login({ token: newToken }));
      } catch {
        localStorage.removeItem("virtustock-token");
        dispatch(logout());
      } finally {
        dispatch(authInitialized());
      }
    };
    init();
  }, []);
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string }>) => {
      const decoded: DecodedToken = jwtDecode(action.payload.token);
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.name = decoded.name;
      state.email = decoded.sub;
      state.roles = decoded.roles;
      state.profilePicUrl = decoded.profilePicUrl;
      state.authInitialized = true;
      localStorage.setItem("virtustock-token", action.payload.token);
    },

    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.name = undefined;
      state.email = undefined;
      state.profilePicUrl = undefined;
      state.roles = [];
      state.authInitialized = true;
      localStorage.removeItem("virtustock-token");
    },

    authInitialized: (state) => {
      state.authInitialized = true;
    },
  },
});

export const { login, logout, authInitialized } = authSlice.actions;
export default authSlice.reducer;
