import axios from 'axios';

export const businessRegister = async (businessData) => {
  try {
    console.log("Registration data being sent:", businessData);
    const response = await axios.post('/auth/business/register', businessData);
    return response;
  } catch (error) {
    console.error("API Error Details:", error.response?.data);
    throw error;
  }
};