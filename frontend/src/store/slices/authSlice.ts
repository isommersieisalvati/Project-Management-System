import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  sessionExpiry: number | null; // Unix timestamp
  isLoading: boolean;
  error: string | null;
}

// Session duration: 30 minutes in milliseconds
const SESSION_DURATION = 30 * 60 * 1000;

// Helper functions for session management
const getStoredSession = () => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const sessionExpiry = localStorage.getItem("sessionExpiry");

    if (token && user && sessionExpiry) {
      const expiryTime = parseInt(sessionExpiry);
      if (Date.now() < expiryTime) {
        return {
          token,
          user: JSON.parse(user),
          sessionExpiry: expiryTime,
        };
      } else {
        // Session expired, clear storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("sessionExpiry");
      }
    }
  } catch (error) {
    console.error("Error loading session:", error);
    // Clear corrupted data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionExpiry");
  }
  return null;
};

const storeSession = (token: string, user: User) => {
  const sessionExpiry = Date.now() + SESSION_DURATION;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("sessionExpiry", sessionExpiry.toString());
  return sessionExpiry;
};

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("sessionExpiry");
};

// Load initial state from localStorage
const storedSession = getStoredSession();

const initialState: AuthState = {
  user: storedSession?.user || null,
  token: storedSession?.token || null,
  sessionExpiry: storedSession?.sessionExpiry || null,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      const { token, user } = response.data;
      const sessionExpiry = storeSession(token, user);
      return { token, user, sessionExpiry };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      email,
      password,
      firstName,
      lastName,
      role = "user",
    }: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role?: "admin" | "user";
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName,
        role,
      });
      const { token, user } = response.data;
      const sessionExpiry = storeSession(token, user);
      return { token, user, sessionExpiry };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Registration failed"
      );
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  clearSession();
  return null;
});

// New thunk for checking session expiry
export const checkSessionExpiry = createAsyncThunk(
  "auth/checkSessionExpiry",
  async (_, { getState, dispatch }) => {
    const state = getState() as { auth: AuthState };
    const { sessionExpiry } = state.auth;

    if (sessionExpiry && Date.now() >= sessionExpiry) {
      dispatch(logout());
      return { expired: true };
    }

    return { expired: false };
  }
);

// New thunk for extending session
export const extendSession = createAsyncThunk(
  "auth/extendSession",
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const { user, token } = state.auth;

    if (user && token) {
      const sessionExpiry = storeSession(token, user);
      return { sessionExpiry };
    }

    return null;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    // Manual logout action (for session expiry)
    sessionExpired: (state) => {
      state.user = null;
      state.token = null;
      state.sessionExpiry = null;
      state.error = "Your session has expired. Please log in again.";
      clearSession();
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.sessionExpiry = action.payload.sessionExpiry;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.sessionExpiry = action.payload.sessionExpiry;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.sessionExpiry = null;
        state.error = null;
      })
      // Extend session
      .addCase(extendSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.sessionExpiry = action.payload.sessionExpiry;
        }
      })
      // Check session expiry
      .addCase(checkSessionExpiry.fulfilled, (state, action) => {
        if (action.payload.expired) {
          state.user = null;
          state.token = null;
          state.sessionExpiry = null;
          state.error = "Your session has expired. Please log in again.";
        }
      });
  },
});

export const { clearError, setUser, sessionExpired } = authSlice.actions;
export default authSlice.reducer;
