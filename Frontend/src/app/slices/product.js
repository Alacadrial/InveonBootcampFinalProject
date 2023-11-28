import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import { PRODUCT_URL, CART_GET_URL, CART_REMOVE_ITEM_URL, CART_URL } from "../../urls/apiUrls";
import axios from "axios";
import { createUpdatePayloadMap } from "../../utils/utils";


const productsSlice = createSlice({
    name: 'products',
    initialState: {
        products: [],
        carts: [],
        favorites: [],
        single: null,  // her bir ürün temsil edelr
        status: 'idle', // Added a status field to manage loading state
        error: null,   // Added an error field to capture errors
    },
    reducers: {
        //sepete ürün eklemek için kullanılacak
        AddToCart: (state, action) => {
            let id  = action.payload;
            let sepeteEklenecekUrun = state.carts.find(item => item.productId === parseInt(id));
            if (sepeteEklenecekUrun === undefined) {
                //sepete eklemek istediğim ürün bilgilerine getirecek ilgili rest servisi çağırılır
                let item = state.products.find(x => x.productId === id);
                console.log(item);
                item.quantity = 1;
                state.carts.push(item);
                Swal.fire(
                    {
                        title: 'Başarılı',
                        text: "Ürün sepete eklendi!",
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2000
                    }
                );
            }
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
          // We can also listen to another slice's action as such, clearing cart after user logs out.
          .addMatcher(
            (action) => action.type.startsWith('user/logout'),
            (state, action) => {
              if (action.type.endsWith('/fulfilled')) {
                state.carts = [];
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

export const { AddToCart, updateProducts, updateCart, clearCart, addToFavorites, removeToFav, clearFav } = productsSlice.actions;
const productsReducer = productsSlice.reducer
export default productsReducer
