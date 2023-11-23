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
