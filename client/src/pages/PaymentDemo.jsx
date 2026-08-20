// Payment Gateway Integration Demo Page
// Demonstrates how to integrate with payment providers like Stripe/PayPal

import React, { useState } from 'react';
import PageContainer from '../components/PageContainer.jsx';
import './PaymentDemo.css';

function PaymentDemo() {
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [refundResult, setRefundResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1999, // $19.99 in cents
          currency: 'usd',
          description: 'Hexa Premium Subscription',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPaymentIntent(data);
    } catch (err) {
      setError(err.message);
      console.error('Payment intent creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!paymentIntent) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentIntent.paymentId,
          paymentMethodId: 'pm_card_visa', // Test payment method ID
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPaymentResult(data);
    } catch (err) {
      setError(err.message);
      console.error('Payment confirmation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refundPayment = async () => {
    if (!paymentIntent) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentIntent.paymentId,
          amount: 999, // Partial refund of $9.99
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRefundResult(data);
    } catch (err) {
      setError(err.message);
      console.error('Payment refund error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Payment Gateway Integration Demo"
      subtitle="Explore how to integrate with payment providers like Stripe/PayPal"
    >
      <div className="payment-demo-page">
        <h2>Understanding Payment Gateway Integration</h2>

        <div className="concept-box">
          <h3>What is Payment Gateway Integration?</h3>
          <p>
            Payment gateway integration allows applications to securely process payments
            by connecting to payment providers like Stripe, PayPal, Square, etc.
          </p>
        </div>

        <div className="concept-box">
          <h3>Key Concepts Demonstrated</h3>
          <ul>
            <li><strong>Payment Intent Creation:</strong> Creating a payment intent represents your intention to collect payment from a customer</li>
            <li><strong>Payment Confirmation:</strong> Confirming the payment with a payment method</li>
            <li><strong>Refunds:</strong> Processing partial or full refunds</li>
            <li><strong>Webhooks:</strong> Handling asynchronous payment events (not shown in demo)</li>
          </ul>
        </div>

        <div className="concept-box">
          <h3>How Hexa Implements Payment Integration</h3>
          <p>
            Hexa uses a mock payment service in <code>server/src/services/paymentService.js</code> that demonstrates:
          </p>
          <ol>
            <li>Creating payment intents with amount, currency, and description</li>
            <li>Confirming payments with payment methods</li>
            <li>Processing refunds (partial and full)</li>
            <li>Retrieving payment details</li>
            <li>Testing payment gateway connections</li>
          </ol>
        </div>

        <div className="concept-box">
          <h3>Interactive Demo</h3>
          <div className="demo-controls">
            {!paymentIntent && (
              <button
                onClick={createPaymentIntent}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Creating Payment Intent...' : 'Create Payment Intent'}
              </button>
            )}

            {paymentIntent && !paymentResult && (
              <div className="payment-intent-info">
                <h4>Payment Intent Created:</h4>
                <p><strong>ID:</strong> {paymentIntent.paymentId}</p>
                <p><strong>Amount:</strong> ${(paymentIntent.amount / 100).toFixed(2)} {paymentIntent.currency.toUpperCase()}</p>
                <p><strong>Status:</strong> {paymentIntent.status}</p>
                <p><strong>Client Secret:</strong> {paymentIntent.clientSecret?.substring(0, 20)}...</p>
                <button
                  onClick={confirmPayment}
                  disabled={loading}
                  className="btn btn-success"
                >
                  {loading ? 'Processing Payment...' : 'Confirm Payment'}
                </button>
              </div>
            )}

            {paymentResult && (
              <div className="payment-result">
                <h4>Payment Result:</h4>
                <p><strong>Status:</strong> {paymentResult.status === 'succeeded' ? '��✅ Succeeded' : '��❌ Failed'}</p>
                <p><strong>Amount:</strong> ${(paymentResult.amount / 100).toFixed(2)} {paymentResult.currency.toUpperCase()}</p>
                {paymentResult.status === 'succeeded' && (
                  <button
                    onClick={refundPayment}
                    disabled={loading}
                    className="btn btn-warning"
                  >
                    {loading ? 'Processing Refund...' : 'Refund $9.99'}
                  </button>
                )}
              </div>
            )}

            {refundResult && (
              <div className="refund-result">
                <h4>Refund Result:</h4>
                <p><strong>Refund ID:</strong> {refundResult.id}</p>
                <p><strong>Amount Refunded:</strong> ${(refundResult.amount / 100).toFixed(2)} {refundResult.currency.toUpperCase()}</p>
                <p><strong>Status:</strong> {refundResult.status}</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            <h4>Error:</h4>
            <p>{error}</p>
          </div>
        )}

        <div className="concept-box">
          <h3>Security Considerations</h3>
          <ul>
            <li>Never expose secret API keys in client-side code</li>
            <li>Use HTTPS in production to protect sensitive data</li>
            <li>Implement proper input validation and sanitization</li>
            <li>Use webhooks for asynchronous payment events</li>
            <li>Follow PCI DSS compliance guidelines when handling payment data</li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
}

export default PaymentDemo;