import { AUTH_URL, REVOKE_URL } from "../urls/apiUrls";
import axios from 'axios';

// On success returns JWT for authenticated user.
export const authenticateUser = async (username, password) => {
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
      const accessToken = response.data.access_token;
      return accessToken;
    } catch (error) {
      // Handle authentication error
      console.error('Authentication error:', error);
      throw error;
    }
  };

export const revokeToken = async (accessToken) => {
    try {
      await axios.post(REVOKE_URL, 
        new URLSearchParams({
          token_type_hint: 'access_token',
          token: accessToken,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      // Handle deauth error
      console.error('Logout error:', error);
      throw error;
    }
  };