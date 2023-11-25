import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authenticateUser, revokeToken } from "../../utils/auth.js";
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
        }
    },
    extraReducers: (builder) => {
        // Handle the fulfilled and rejected actions from getProductByIdAsync
        builder.addMatcher(
            (action) => action.type.startsWith('user/loginAsync'),
            (state, action) => {
              if (action.type.endsWith('/pending')) {
                state.status = 'loading';
              } else if (action.type.endsWith('/fulfilled')) {
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
              } else if (action.type.endsWith('/rejected')) {
                state.status = 'failed';
                state.error = action.error.message;
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
        )
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

export const logout = createAsyncThunk(
    'user/logout',
    async (payload, { getState }) => {
        // for now empty.
        //let {token} = getState().user.user
        //await revokeToken(token);
    }
);

const userReducer = userSlice.reducer
export const { register } = userSlice.actions;
export default userReducer