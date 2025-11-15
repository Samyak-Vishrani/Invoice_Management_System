import SERVER_API from "./server.api.js";

export const generateInvoicePDF = `${SERVER_API}/pdf/generate`;
export const downloadInvoicePDF = `${SERVER_API}/pdf/download`;
export const viewInvoicePDF = `${SERVER_API}/pdf/view`;
export const regenerateInvoicePDF = `${SERVER_API}/pdf/regenerate`;
export const deleteInvoicePDF = `${SERVER_API}/pdf/delete`;