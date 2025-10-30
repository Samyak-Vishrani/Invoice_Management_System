import SERVER_API from "./server.api.js";

export const userRegister = `${SERVER_API}/auth/user-register`;
export const userLogin = `${SERVER_API}/auth/user-login`;
export const clientRegister = `${SERVER_API}/auth/client-register`;
export const clientLogin = `${SERVER_API}/auth/client-login`;

export const updatePassword = `${SERVER_API}/auth/update-password`;

// export const forgotPassword = `${SERVER_API}/users/forgot-password`;
// export const verifyResetCode = `${SERVER_API}/users/verify-reset-code`;
// export const resetPassword = `${SERVER_API}/users/reset-password`;

// export const authUsers = `${SERVER_API}/auth/users`;