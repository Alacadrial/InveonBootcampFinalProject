import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authenticateUser } from "../../utils/auth.js";
import { decodeJwt } from "../../utils/utils.js";
import { useDispatch } from "react-redux";
import { getCartByUserId } from "./product.js";

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
        logout: (state) => {
            state.status = false
            state.user = {
            }
        }
    },
    extraReducers: (builder) => {
        // Handle the fulfilled and rejected actions from getProductByIdAsync
        builder
          .addCase(loginAsync.pending, (state) => {
            state.loadStatus = 'loading';
          })
          .addCase(loginAsync.fulfilled, (state, action) => {
            let {username, pwd, token} = action.payload; 
            let decodedObj = decodeJwt(token);
            state.loadStatus = 'succeeded';
            state.status = true;
            state.user = {
                name: decodedObj.given_name + " " + decodedObj.family_name,
                userId: decodedObj.sub,
                role: 'customer',
                email: username,
                pass: pwd,
                token: token
            };
          })
          .addCase(loginAsync.rejected, (state, action) => {
            state.loadStatus = 'failed';
            state.error = action.error.message;
          });
      },
})

// Create an asynchronous thunk
export const loginAsync = createAsyncThunk(
    'user/loginAsync',
    async (credentials) => {
        let {username, pwd} = credentials
        let token = await authenticateUser(username, pwd);
        return {username, pwd, token};
    }
);

const userReducer = userSlice.reducer
export const { register, logout } = userSlice.actions;
export default userReducer