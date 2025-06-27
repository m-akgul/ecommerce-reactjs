/**
 * A safe axios wrapper that handles errors with toast and returns response data or null.
 * 
 * @param {Function} axiosCall - () => axios.get(...) or axios.post(...)
 * @param {string} fallbackMessage - custom fallback message if no message from server
 * @returns response.data or null
 */
export async function safeAxios(axiosCall, fallbackMessage = "Request failed.") {
  try {
    const res = await axiosCall();
    return res.data;
  } catch (err) {
    // Let 401 bubble up to the axios interceptor
    if (err.response?.status === 401) {
      throw err;
    }
    
    return err.response?.data?.Message || fallbackMessage;
  }
}
