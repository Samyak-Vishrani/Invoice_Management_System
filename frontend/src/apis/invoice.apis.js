import SERVER_API from "./server.api.js";

export const getAllInv = `${SERVER_API}/invoice`;
export const createInv = `${SERVER_API}/invoice/create`;
export const getInvStats = `${SERVER_API}/invoice/stats`;
export const getInvDetails = `${SERVER_API}/invoice`;
export const changeInvStatus = `${SERVER_API}/invoice/status`;
export const updateInv = `${SERVER_API}/invoice`;
export const deleteInv = `${SERVER_API}/invoice`;