// Payment Routes
// Demonstrates payment gateway integration endpoints

import express from 'express';
import paymentService from '../services/paymentService.js';

const router = express.Router();

// Create a payment intent
router.post('/create-intent', async (req, res, next) => {
  try {
    const { amount, currency, description, metadata } = req.body;

    const paymentIntent = await paymentService.createPaymentIntent({
      amount,
      currency,
      description,
      metadata: metadata || {}
    });

    res.status(201).json({
      paymentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });
  } catch (error) {
    next(error);
  }
});

// Confirm a payment
router.post('/confirm', async (req, res, next) => {
  try {
    const { paymentId, paymentMethodId } = req.body;

    const paymentResult = await paymentService.confirmPayment(paymentId, {
      id: paymentMethodId
    });

    res.status(200).json(paymentResult);
  } catch (error) {
    next(error);
  }
});

// Refund a payment
router.post('/refund', async (req, res, next) => {
  try {
    const { paymentId, amount } = req.body;

    const refundResult = await paymentService.refundPayment(paymentId, amount);

    res.status(200).json(refundResult);
  } catch (error) {
    next(error);
  }
});

// Retrieve payment details
router.get('/:paymentId', async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const paymentDetails = await paymentService.retrievePayment(paymentId);

    res.status(200).json(paymentDetails);
  } catch (error) {
    next(error);
  }
});

// Test payment gateway connection
router.get('/test-connection', async (req, res, next) => {
  try {
    const connectionResult = await paymentService.testConnection();

    res.status(200).json(connectionResult);
  } catch (error) {
    next(error);
  }
});

export default router;