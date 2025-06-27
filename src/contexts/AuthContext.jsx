import { useEffect, useState } from "react";
import { getToken, setToken, removeToken } from "../utils/tokenHelper";
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS, CLAIMS } from "../utils/constants";
import axios from "../api/axios";
import { safeAxios } from "../api/axiosWrapper";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [token, setAuthToken] = useState(getToken());
  const [user, setUser] = useState(null);

  const isAuthenticated = !!token;

  const login = async (jwtToken) => {
    setToken(jwtToken);
    setAuthToken(jwtToken);

    try {
      const decoded = jwtDecode(jwtToken);
      setUser({
        id: decoded[CLAIMS.NAMEIDENTIFIER],
        email: decoded[CLAIMS.EMAIL],
        phone: decoded[CLAIMS.PHONE],
        name: decoded[CLAIMS.NAME],
        roles: [].concat(decoded[CLAIMS.ROLE] || []),
      });
    } catch (error) {
      console.error("Invalid token:", error);
    }

    const result = await safeAxios(
      () =>
        axios.get(API_ENDPOINTS.PROFILE, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }),
      "Login succeeded but /me failed."
    );

    if (result && result.success) {
      const user = result.data;
      setUser({
        id: user.id,
        email: user.email,
        name: user.username,
        phone: user.phone,
        roles: user.roles,
      });
    } else {
      console.error("Login succeeded but /me failed.");
      removeToken();
      setAuthToken(null);
      setUser(null);
    }
  };

  const logout = () => {
    removeToken();
    setAuthToken(null);
    setUser(null);
  };

  useEffect(() => {
    const savedToken = getToken();
    if (!savedToken) return;

    setAuthToken(savedToken);

    axios
      .get(API_ENDPOINTS.PROFILE, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
      .then((res) => {
        const user = res.data.data;
        setUser({
          id: user.id,
          email: user.email,
          name: user.username,
          phone: user.phone,
          roles: user.roles,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch user info:", err);
        removeToken(); // Clear token if it's invalid
        setAuthToken(null);
        setUser(null);
      });
    // * Uncomment the following block if you want to decode the token directly instead of fetching user info
    // if (savedToken) {
    //   try {
    //     const decoded = jwtDecode(savedToken);
    //     setAuthToken(savedToken);
    //     setUser({
    //       id: decoded[CLAIMS.ID],
    //       email: decoded[CLAIMS.EMAIL],
    //       name: decoded[CLAIMS.NAME],
    //       roles: [].concat(decoded[CLAIMS.ROLE] || []),
    //     });
    //   } catch {
    //     removeToken();
    //     setAuthToken(null);
    //     setUser(null);
    //   }
    // }
  }, []);

  const value = {
    token,
    isAuthenticated,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
