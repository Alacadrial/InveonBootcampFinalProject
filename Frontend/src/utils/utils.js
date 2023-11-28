import { jwtDecode } from "jwt-decode";

export const decodeJwt = (token) => {
    try {
        const decoded = jwtDecode(token); 
        return decoded;
      } catch (error) {
        console.error('Error decoding JWT:', error.message);
        return null;
      }
}


export const createUpdatePayloadMap = (cart, product, quantity, userId) => {
  // Check if the product is already in the cart
  const isProductInCart = cart.some(item => item.productId === product.productId);

  // If the product is in the cart, update the quantity; otherwise, append the product
  const updatedCart = isProductInCart
    ? cart.map(item => (item.productId === product.productId ? { ...item, quantity } : item))
    : [...cart, { ...product, quantity }];

  const payload = {
    cartHeader: {
      cartHeaderId: 0,
      couponCode: null,
      userId: userId
    },
    cartDetails: updatedCart.map(({ quantity, detailsId, ...formatted }) => ({
      cartHeaderId: 0,
      cartDetailsId: 0,
      count: quantity,
      productId: formatted.productId,
      product: formatted
    }))
  };

  console.log("Payload that will be sent for createUpdate: ", payload);
  return payload;
};