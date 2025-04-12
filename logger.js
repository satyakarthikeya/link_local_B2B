/**
 * Logger utility for debugging API calls and responses
 */
export const logger = {
  request: (url, data) => {
    console.group(`🚀 API Request to ${url}`);
    console.log('Request data:', data);
    console.groupEnd();
  },
  
  response: (url, data) => {
    console.group(`✅ API Response from ${url}`);
    console.log('Response data:', data);
    console.groupEnd();
  },
  
  error: (url, error) => {
    console.group(`❌ API Error from ${url}`);
    console.error('Error:', error.message);
    console.error('Response data:', error.response?.data);
    console.error('Status:', error.response?.status);
    console.trace();
    console.groupEnd();
  }
};
