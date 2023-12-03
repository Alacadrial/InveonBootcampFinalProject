import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import { PRODUCT_URL, CART_GET_URL, CART_REMOVE_ITEM_URL, CART_URL, FAVOURITES_URL, ORDER_URL, APPLY_COUPON_URL } from "../../urls/apiUrls";
import axios from "axios";
import { createUpdatePayloadMap } from "../../utils/utils";


const productsSlice = createSlice({
    name: 'products',
    initialState: {
        products: [],
        carts: [],
        favorites: [],
        orders: [],
        coupon: null,
        single: null,  // her bir ürün temsil edelr
        status: 'idle', // Added a status field to manage loading state
        error: null,   // Added an error field to capture errors
    },
    reducers: {
        
        clearError: (state, action) => {
          state.error = null;
        },
        updateProducts: (state, action) => {
            console.log(action.payload)
            return { ...state, products: action.payload };
        },
        updateCart: (state, action) => {
            let { val, id } = action.payload;
            state.carts.forEach(item => {
                if (item.productId === parseInt(id)) {
                    item.quantity = val
                }
            })
        },
        removeCartItem: (state, action) => {
            let { id } = action.payload;
            let sepetinOnSonHali = state.carts.filter(item => item.productId !== parseInt(id))
            state.carts = sepetinOnSonHali
        },
        //sepeti comple silmek için
        clearCart: (state) => {
            state.carts = []
        },
        addToFavorites: (state, action) => {

            let { id } = action.payload;
            let item = state.favorites.find(item => item.productId === parseInt(id))
            if (item === undefined) {
                let urunFavori = state.products.find(item => item.productId === parseInt(id))
                urunFavori.quantity = 1
                state.favorites.push(urunFavori)
                Swal.fire(
                    {
                        title: 'Başarılı',
                        text: 'İlgili ürün favorilere eklenmiştir',
                        icon: 'success'
                    }
                )
            }
            else {
                Swal.fire('Başarsız', 'İlgili ürün favorilere eklenemedi', 'warning')
            }

        },
        removeToFav: (state, action) => {
            let { id } = action.payload;
            let favorilerinOnSonHali = state.favorites.filter(item => item.productId !== parseInt(id))
            state.favorites = favorilerinOnSonHali
        },
        //favorileri temizle
        clearFav: (state) => {
            state.favorites = [] // state içindeki favori arrayını temizlemiş oluyor 
        }
    },
    extraReducers: (builder) => {
        builder.addMatcher(
          (action) => action.type.startsWith('products/getProductsAsync'),
          (state, action) => {
            if (action.type.endsWith('/pending')) {
              state.status = 'loading';
            } else if (action.type.endsWith('/fulfilled')) {
              state.status = 'succeeded';
              state.products = action.payload;
            } else if (action.type.endsWith('/rejected')) {
              state.status = 'failed';
              state.error = action.error.message;
            }
          }
          )
          .addMatcher(
            (action) => action.type.startsWith('products/getProductByIdAsync'),
            (state, action) => {
              if (action.type.endsWith('/pending')) {
                state.status = 'loading';
              } else if (action.type.endsWith('/fulfilled')) {
                state.status = 'succeeded';
                state.single = action.payload;
              } else if (action.type.endsWith('/rejected')) {
                state.status = 'failed';
                state.error = action.error.message;
              }
            }
          )
          .addMatcher(
            (action) => action.type.startsWith('products/getCartByUserId'),
            (state, action) => {
              if (action.type.endsWith('/pending')) {
                state.status = 'loading';
              } else if (action.type.endsWith('/fulfilled')) {
                state.status = 'succeeded';
                // re-mapping the data in my desired format.
                state.carts = action.payload.cartDetails.map((itemDetails) => {
                  return {
                    productId: itemDetails.product.productId,
                    name: itemDetails.product.name,
                    price: itemDetails.product.price,
                    description: itemDetails.product.description,
                    categoryName: itemDetails.product.categoryName,
                    imageUrl: `https://placehold.co/300x440/orange/white?text=${encodeURIComponent(itemDetails.product.name)}`, // itemDetails.product.imageUrl,
                    quantity: itemDetails.count,
                    detailsId: itemDetails.cartDetailsId
                  };
                });
              } else if (action.type.endsWith('/rejected')) {
                state.status = 'failed';
                state.error = action.error.message;
              }
            }
          )
          .addMatcher(
            (action) => action.type.startsWith('products/removeCartItemAsync'),
            (state, action) => {
              if (action.type.endsWith('/fulfilled')) {
                let detailsId = action.payload;
                let afterRemoval = state.carts.filter(item => item.detailsId !== parseInt(detailsId))
                state.carts = afterRemoval
              }
            })
          .addMatcher(
            (action) => action.type.startsWith('products/updateCartAsync'),
            (state, action) => {
              if (action.type.endsWith('/fulfilled')) {
                if(action.payload){
                  state.carts = action.payload.cartDetails.map((itemDetails) => {
                    return {
                      productId: itemDetails.product.productId,
                      name: itemDetails.product.name,
                      price: itemDetails.product.price,
                      description: itemDetails.product.description,
                      categoryName: itemDetails.product.categoryName,
                      imageUrl: `https://placehold.co/300x440/orange/white?text=${encodeURIComponent(itemDetails.product.name)}`,
                      quantity: itemDetails.count,
                      detailsId: itemDetails.cartDetailsId
                    };
                  });
                }
              }
            })
          .addMatcher(
            (action) => action.type.startsWith('products/clearCartAsync'),
            (state, action) => {
              if (action.type.endsWith('/fulfilled')) {
                if(action.payload){
                  state.carts = [];
                }
              }
            })
          .addMatcher(
            (action) => action.type.startsWith('products/getFavouritesAsync'),
            (state, action) => {
              if (action.type.endsWith('/fulfilled')) {
                let {isSuccess, result} = action.payload
                if(isSuccess){
                  state.favorites = result.map(favourite => {
                    let {favouriteId, userId, ...product} = favourite.product;
                    return product
                  });
                }
              }
            })
            .addMatcher(
              (action) => action.type.startsWith('products/addFavouriteAsync'),
              (state, action) => {
                if (action.type.endsWith('/fulfilled')) {
                  console.log(action.payload)
                  let {isSuccess, product} = action.payload
                  if(isSuccess){
                    state.favorites = [...state.favorites, product]
                  }
                }
              })
            .addMatcher(
              (action) => action.type.startsWith('products/deleteFavouriteAsync'),
              (state, action) => {
                if (action.type.endsWith('/fulfilled')) {
                  let {isSuccess, productId} = action.payload
                  if(isSuccess){
                    state.favorites = state.favorites.filter(product => product.productId !== productId);
                  }
                }
              })
            .addMatcher(
              (action) => action.type.startsWith('products/getOrdersAsync'),
              (state, action) => {
                if (action.type.endsWith('/fulfilled')) {
                  state.orders = action.payload;
                }
              })
            .addMatcher(
              (action) => action.type.startsWith('products/applyCouponAsync',),
              (state, action) => {
                if (action.type.endsWith('/fulfilled')) {
                  state.coupon = action.payload;
                }
                else if (action.type.endsWith('/rejected')) {
                  console.log(action)
                  state.error = action.payload.message;
                }
              })
          // We can also listen to another slice's action as such, clearing cart after user logs out.
          .addMatcher(
            (action) => action.type.startsWith('user/logout'),
            (state, action) => {
              if (action.type.endsWith('/fulfilled')) {
                state.carts = [];
                state.favorites = [];
                state.coupon = null;
              }
            });
      },
})

export const clearCartAsync = createAsyncThunk(
  'products/clearCartAsync',
  async (payload, {getState}) => {
    try {
      const token = getState().user.user.token;
      const url = `${CART_URL}`;
      const response = await axios.delete(
        url,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        }
      );
      console.log(response)
      return response.data.isSuccess;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
);


export const updateCartAsync = createAsyncThunk(
  'products/updateCartAsync',
  async (payload, {getState}) => {
    try {
      const currentCarts = getState().products.carts;
      const user = getState().user.user;
      let {product, quantity} = payload;
      const url = `${CART_URL}`;
      let requestPayload = createUpdatePayloadMap(currentCarts, product, quantity, user.userId);
      const response = await axios.post(
        url,
        requestPayload, 
        {
          headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${user.token}`
          },
        }
      );
      console.log(response)
      return response.data.result;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
);

export const removeCartItemAsync = createAsyncThunk(
  'products/removeCartItemAsync',
  async (detailsId, {getState}) => {
    try {
      let token = getState().user.user.token;
      const url = `${CART_REMOVE_ITEM_URL}`;
      const response = await axios.post(
        url,
        detailsId, 
        {
          headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
          },
        }
      );
      return detailsId;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
);
export const getProductsAsync = createAsyncThunk(
  'products/getProductsAsync',
  async () => {
    try {
      const url = `${PRODUCT_URL}`;
      const response = await axios.get(url);
      const data = response.data.result;
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
);

export const getProductByIdAsync = createAsyncThunk(
    'products/getProductByIdAsync',
    async (id) => {
      try {
        const url = `${PRODUCT_URL}/${id}`;
        const response = await axios.get(url);
        const data = response.data.result;
        return data;
      } catch (error) {
        // Handle errors here
        console.error('Error fetching data:', error);
      }
    }
);

export const getCartByUserId = createAsyncThunk(
    'products/getCartByUserId',
    async (userId) => {
      try {
        const url = `${CART_GET_URL}/${userId}`;
        const response = await axios.get(url);
        const data = response.data.result;
        console.log(data);
        return data;
      } catch (error) {
        // Handle errors here
        console.error('Error fetching data:', error);
      }
    }
);



/// Fav
export const getFavouritesAsync = createAsyncThunk(
  'products/getFavouritesAsync',
  async (payload, {getState}) => {
      const url = `${FAVOURITES_URL}`;
      const {token} = getState().user.user;
      const response = await axios.get(
        url, 
        {
            headers: {
              'Authorization': `Bearer ${token}`
            },
        }
      );
      return response.data;
  }
);

export const addFavouriteAsync = createAsyncThunk(
  'products/addFavouriteAsync',
  async (product, {getState}) => {
      const url = `${FAVOURITES_URL}`;
      const {userId, token} = getState().user.user;
      const response = await axios.post(
        url,
        {
          favouriteId:0,
          userId:userId,
          productId:product.productId,
          product:product
        },
        {
            headers: {
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${token}`
            },
        }
      );
      return {isSuccess: response.data.isSuccess, product: product};
  }
);

export const deleteFavouriteAsync = createAsyncThunk(
  'products/deleteFavouriteAsync',
  async (productId, {getState}) => {
      const url = `${FAVOURITES_URL}`;
      const {token} = getState().user.user;
      console.log(token, productId)
      const response = await axios.delete(
        url,
        {
            headers: {
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${token}`
            },
            data: productId
        }
      );
      return {isSuccess: response.data.isSuccess, productId: productId};
  }
);


export const getOrdersAsync = createAsyncThunk(
  'products/getOrdersAsync',
  async (payload, {getState}) => {
      const url = `${ORDER_URL}/paymentcompleted`;
      const {token} = getState().user.user;
      const response = await axios.get(
        url,
        {
            headers: {
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${token}`
            }
        }
      );
      return response.data;
  }
);

export const applyCouponAsync = createAsyncThunk(
  'products/applyCouponAsync',
  async (couponCode, {getState, rejectWithValue}) => {
      let token = getState().user.user.token;
      let response = await axios.post(
        APPLY_COUPON_URL,
        couponCode,
        {
            headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token}
        }
      )
      if(response.status === 200 && response.data.isSuccess)
        return response.data.result;
      else if (response.status === 200)
        return rejectWithValue({ message: response.data.errorMessages[0], rejectedWithValue: true });
      else
        return rejectWithValue({ message: "Error connecting to backend.", rejectedWithValue: true });
  }
);




export const { updateProducts, updateCart, clearCart, clearError, addToFavorites, removeToFav, clearFav } = productsSlice.actions;
const productsReducer = productsSlice.reducer
export default productsReducer
