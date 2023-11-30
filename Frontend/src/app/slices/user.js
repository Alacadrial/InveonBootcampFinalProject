import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authenticateUser, revokeToken } from "../../utils/auth.js";
import { decodeJwt } from "../../utils/utils.js";
import { useDispatch } from "react-redux";
import { getCartByUserId } from "./product.js";
import { AUTH_URL, REGISTER_URL } from "../../urls/apiUrls.js";
import axios from "axios";

const userSlice = createSlice({
    name: 'user',
    initialState: {
        status: false,
        loadStatus: "idle",
        error: null,
        user: {},
    },
    reducers: {
        register: (state, action) => {
            let { name, email, pass } = action.payload;
            state.status = true
            state.user = {
                name: name,
                role: 'customer',
                email: email,
                pass: pass
            }
        },
        clearError: (state) => {
          state.error = null
        }
    },
    extraReducers: (builder) => {
        // Handle the fulfilled and rejected actions from getProductByIdAsync
        builder.addMatcher(
            (action) => action.type.startsWith('user/loginAsync'),
            (state, action) => {
              if (action.type.endsWith('/fulfilled')) {
                let token = action.payload; 
                let decodedObj = decodeJwt(token);
                state.loadStatus = 'succeeded';
                state.status = true;
                state.user = {
                    name: decodedObj.given_name + " " + decodedObj.family_name,
                    userId: decodedObj.sub,
                    role: 'customer',
                    email: "username",
                    pass: "pwd",
                    token: token
                };
              } else if (action.type.endsWith('/rejected')) {
                state.error = action.payload.message;
              }
            }
        ).addMatcher(
            (action) => action.type.startsWith('user/logout'),
            (state, action) => {
              if (action.type.endsWith('/fulfilled')) {
                state.status = false;
                state.user = {};
              } 
            }
        ).addMatcher(
          (action) => action.type.startsWith('user/registerAsync'),
          (state, action) => {
            if (action.type.endsWith('/fulfilled')) {
              let token = action.payload;
              let decodedObj = decodeJwt(token);
              state.loadStatus = 'succeeded';
              state.status = true;
              state.user = {
                  name: decodedObj.given_name + " " + decodedObj.family_name,
                  userId: decodedObj.sub,
                  role: 'customer',
                  email: "",
                  pass: "",
                  token: token
              };
            }else if (action.type.endsWith('/rejected')) {
              console.log(action.payload.message)
              state.error = action.payload.message;
            }
          }
      )
      },
})

// Create an asynchronous thunk
export const loginAsync = createAsyncThunk(
    'user/loginAsync',
    async ({username, password}, {rejectWithValue}) => {
      try {
        const response = await axios.post(AUTH_URL, 
          new URLSearchParams({
            grant_type: 'password',
            username: username,
            password: password,
            client_id: 'react_client',
            client_secret: 'react_secret',
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        return response.data.access_token;
      } 
      catch (error) {
        if(error.response.data.error_description)
          throw rejectWithValue({ message: error.response.data.error_description, rejectedWithValue: true });
        else if (error.request)
          throw rejectWithValue({ message: 'No response received', rejectedWithValue: true });
        else {
          throw rejectWithValue({ message: error.message, rejectedWithValue: true });
        }
      }
    }
);

export const registerAsync = createAsyncThunk(
  'user/registerAsync',
  async (credentials, {rejectWithValue}) => {
    try {
      let response = await axios.post(
        REGISTER_URL, 
        credentials
      );
      return response.data.access_token;
    } 
    catch (error) {
      if(error.response)
        throw rejectWithValue({ message: error.response.data, rejectedWithValue: true });
      else if (error.request)
        throw rejectWithValue({ message: 'No response received', rejectedWithValue: true });
      else {
        throw rejectWithValue({ message: error.message, rejectedWithValue: true });
      }
    }
  }
);

export const logout = createAsyncThunk(
    'user/logout',
    async (payload, { getState }) => {
        // for now empty.
        //let {token} = getState().user.user
        //await revokeToken(token);
    }
);

const userReducer = userSlice.reducer
export const { register, clearError } = userSlice.actions;
export default userReducer