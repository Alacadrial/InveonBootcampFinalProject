import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import { PRODUCT_URL, CART_GET_URL } from "../../urls/apiUrls";
import axios from "axios";


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
        removeCart: (state, action) => {
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
                    imageUrl: itemDetails.product.imageUrl,
                    quantity: itemDetails.count,
                  };
                });
              } else if (action.type.endsWith('/rejected')) {
                state.status = 'failed';
                state.error = action.error.message;
              }
            }
          )
          // We can also listen to another slice's action as such, this may come in handy later
          .addMatcher(
            (action) => action.type.startsWith('user/loginAsync'),
            (state, action) => {
              if (action.type.endsWith('/fulfilled')) {
                console.log("Listening user login inside productSlice, userLogInSuccess");
              }
            });
      },
})

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
      throw error;
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
        throw error;
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
        throw error;
      }
    }
);

export const { AddToCart, updateProducts, updateCart, removeCart, clearCart, addToFavorites, removeToFav, clearFav } = productsSlice.actions;
const productsReducer = productsSlice.reducer
export default productsReducer
