export const CLAIMS = {
  ID: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  EMAIL: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  PHONE: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone",
  NAME: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  ROLE: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  EXPIRE: "exp"
};

export const API_BASE_URL = "http://localhost:5126/api/";

export const ROLES = {
  ADMIN: "Admin",
  CUSTOMER: "Customer",
  VIP: "VIP"
};
export const API_ENDPOINTS = {
  REGISTER: "Auth/register",
  LOGIN: "Auth/login",
  LOGOUT: "Auth/logout",
  GOOGLE_LOGIN: "Auth/signin-google",
  PROFILE: "Profile/me",
  PROFILE_UPDATE: "Profile",
  CATEGORIES: "Categories",
  PRODUCTS: "Products",
  ORDERS: "Orders",
  CART: "Cart",
  ADDRESSES: "Addresses",
  FAVORITES: "Favorites",
  ADMIN_PRODUCTS: "admin/products",
  ADMIN_CATEGORIES: "admin/categories",
  ADMIN_COUPONS: "admin/coupons",
  ADMIN_ORDERS: "admin/orders",
  ADMIN_USERS: "admin/users",
  ADMIN_ROLES: "admin/roles",
};