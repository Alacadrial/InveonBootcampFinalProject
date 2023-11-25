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
  let productToChange = cart.find(item => item.productId == product.productId);
  let desiredArr = [];
  if(productToChange)
  {
    productToChange.quantity = quantity
    desiredArr = cart
  }
  else
  {
    desiredArr = [...cart, product];
  }
  let payload = {
    "cartHeader" : {
      "cartHeaderId":0,
      "couponCode": null,
      "userId": userId
  },
  "cartDetails" : desiredArr.map(item => {
    const { quantity, detailsId, ...formatted } = item;
    return {
      cartHeaderId: 0,
      cartDetailsId: 0,
      count: quantity,
      productId: item.productId,
      product: formatted
    }
  })
  };

  console.log("Payload that will be sent for createUpdate: ", payload);
  return payload; 
}