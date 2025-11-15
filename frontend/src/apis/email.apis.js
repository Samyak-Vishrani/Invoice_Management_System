import SERVER_API from "./server.api.js";

export const sendInvoice = `${SERVER_API}/email/send-invoice`;
export const sendPaymentReminder = `${SERVER_API}/email/send-reminder`;
export const sendPaymentConfirmation = `${SERVER_API}/email/send-confirmation`;
export const sendBulkReminders = `${SERVER_API}/email/bulk-reminders`;
export const getEmailLogs = `${SERVER_API}/email/logs`;