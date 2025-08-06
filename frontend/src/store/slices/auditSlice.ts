import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export interface AuditLog {
  id: number
  userId: number
  userEmail: string
  action: string
  entityType: string
  entityId?: number
  details?: string
  timestamp: string
}

export interface AuditState {
  logs: AuditLog[]
  isLoading: boolean
  error: string | null
}

const initialState: AuditState = {
  logs: [],
  isLoading: false,
  error: null,
}

// Helper function to get auth header
const getAuthConfig = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// Async thunks
export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchAuditLogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/audit`, getAuthConfig())
      return response.data.logs
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit logs')
    }
  }
)

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false
        state.logs = action.payload
        state.error = null
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = auditSlice.actions
export default auditSlice.reducer