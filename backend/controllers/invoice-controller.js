const Invoice = require('../models/invoice-model');
const Client = require('../models/client-model');
const User = require('../models/user-model');
const { sendInvoice } = require('./email-controller');
const mongoose = require('mongoose');

// Create new invoice
const createInvoice = async (req, res) => {
    try {
        const { clientId, dueDate, items, notes, terms, discountAmount, sendEmail = true } = req.body;
        const userId = req.user.userId;

        // Check if client exists and belongs to user
        const client = await Client.findOne({ _id: clientId, userId });
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Generate invoice number
        const lastInvoice = await Invoice.findOne({ userId }).sort({ createdAt: -1 });
        const invoiceCount = await Invoice.countDocuments({ userId }) + 1;
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount).padStart(4, '0')}`;

        // Create invoice
        const invoice = new Invoice({
            userId,
            clientId,
            invoiceNumber,
            dueDate: new Date(dueDate),
            items: items || [],
            notes: notes || '',
            terms: terms || '',
            discountAmount: discountAmount || 0,
            status: 'draft'
        });

        await invoice.save();

        // Populate client details for response
        await invoice.populate('clientId', 'name company');

        let emailSent = false;
        let emailError = null;
        // Automatically send invoice email if sendEmail is true
        if (sendEmail) {
            try {
                // Create mock request and response objects for email controller
                const emailReq = {
                    params: { invoiceId: invoice._id },
                    body: { customMessage: 'Thank you for your business.' },
                    user: req.user
                };
                
                const emailRes = {
                    status: function(code) {
                        return this;
                    },
                    json: function(data) {
                        console.log('Email sent:', data);
                        return this;
                    }
                };

                await sendInvoice(emailReq, emailRes);
                emailSent = true;

            } catch (emailError) {
                // Don't fail the whole request if email fails
                emailSent = false;
                emailError = error.message;
                console.error('Failed to send invoice email:', emailError);
            }
        }

        return res.status(201).json({
            success: true,
            message: emailSent 
                ? 'Invoice created successfully' 
                : 'Invoice created successfully but email could not be sent',
            data: invoice,
            emailStatus: {
                sent: emailSent,
                error: emailError
            }
        });

    } catch (error) {
        console.error('Create invoice error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create invoice',
            error: error.message
        });
    }
};

// Get all invoices
const getAllInvoices = async (req, res) => {
    try {
        const userId = req.user.userId;

        const invoices = await Invoice.find({ userId })
            .populate('clientId', 'name company')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices
        });

    } catch (error) {
        console.error('Get all invoices error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch invoices',
            error: error.message
        });
    }
};

// Get single invoice details
const getInvoiceDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const invoice = await Invoice.findOne({ _id: id, userId })
            .populate('clientId', 'name email company')
            .populate('userId', 'name businessDetails');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: invoice
        });

    } catch (error) {
        console.error('Get invoice details error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch invoice details',
            error: error.message
        });
    }
};

// Update invoice
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const updateData = req.body;

        // Find invoice
        const invoice = await Invoice.findOne({ _id: id, userId });
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Don't allow updates if invoice is paid
        if (invoice.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update paid invoice'
            });
        }

        // Update allowed fields
        const allowedUpdates = ['dueDate', 'items', 'notes', 'terms', 'discountAmount'];
        allowedUpdates.forEach(field => {
            if (updateData[field] !== undefined) {
                invoice[field] = updateData[field];
            }
        });

        await invoice.save();

        // Populate client details for response
        await invoice.populate('clientId', 'name company');

        return res.status(200).json({
            success: true,
            message: 'Invoice updated successfully',
            invoice
        });

    } catch (error) {
        console.error('Update invoice error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update invoice',
            error: error.message
        });
    }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const invoice = await Invoice.findOne({ _id: id, userId });
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Don't allow deletion if invoice has payments
        if (invoice.payments.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete invoice with payments'
            });
        }

        // Don't allow deletion if invoice is not draft or cancelled
        if (!['draft', 'cancelled'].includes(invoice.status)) {
            return res.status(400).json({
                success: false,
                message: 'Can only delete draft or cancelled invoices'
            });
        }

        await Invoice.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Invoice deleted successfully'
        });

    } catch (error) {
        console.error('Delete invoice error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete invoice',
            error: error.message
        });
    }
};

// Change invoice status
const changeInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const userId = req.user.userId;

        // Validate status
        const validStatuses = ['draft', 'sent', 'viewed', 'partial_paid', 'paid', 'overdue', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const invoice = await Invoice.findOne({ _id: id, userId });
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Use the model method to change status
        await invoice.changeStatus(status, {
            userId: userId,
            role: 'user'
        }, reason);

        // Populate client details for response
        await invoice.populate('clientId', 'name company');

        return res.status(200).json({
            success: true,
            message: 'Invoice status updated successfully',
            invoice
        });

    } catch (error) {
        console.error('Change invoice status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update invoice status',
            error: error.message
        });
    }
};

// Get invoice statistics
const getInvoiceStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Basic counts by status
        const statusCounts = await Invoice.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Financial stats
        const financialStats = await Invoice.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                    totalPaid: { $sum: '$totalPaid' },
                    totalPending: { $sum: '$remainingAmount' }
                }
            }
        ]);

        // Monthly stats for current year
        const currentYear = new Date().getFullYear();
        const monthlyStats = await Invoice.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    invoiceDate: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lt: new Date(`${currentYear + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$invoiceDate' },
                    totalAmount: { $sum: '$totalAmount' },
                    totalPaid: { $sum: '$totalPaid' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Recent overdue invoices
        const overdueInvoices = await Invoice.find({
            userId: new mongoose.Types.ObjectId(userId),
            status: 'overdue'
        })
            .populate('clientId', 'name company')
            .sort({ dueDate: 1 })
            .limit(5);

        // Format status counts
        const statusMap = {};
        statusCounts.forEach(item => {
            statusMap[item._id] = item.count;
        });

        // Ensure all statuses are included
        const allStatuses = ['draft', 'sent', 'viewed', 'partial_paid', 'paid', 'overdue', 'cancelled'];
        allStatuses.forEach(status => {
            if (!statusMap[status]) {
                statusMap[status] = 0;
            }
        });

        const stats = {
            statusCounts: statusMap,
            financial: financialStats[0] || {
                totalInvoices: 0,
                totalAmount: 0,
                totalPaid: 0,
                totalPending: 0
            },
            monthly: monthlyStats,
            overdueInvoices,
            summary: {
                totalInvoices: statusMap.draft + statusMap.sent + statusMap.viewed + statusMap.partial_paid + statusMap.paid + statusMap.overdue + statusMap.cancelled,
                paidInvoices: statusMap.paid,
                pendingInvoices: statusMap.sent + statusMap.viewed + statusMap.partial_paid + statusMap.overdue,
                draftInvoices: statusMap.draft
            }
        };

        return res.status(200).json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Get invoice stats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch invoice statistics',
            error: error.message
        });
    }
};

module.exports = {
    createInvoice,
    getAllInvoices,
    getInvoiceDetails,
    updateInvoice,
    deleteInvoice,
    changeInvoiceStatus,
    getInvoiceStats
};