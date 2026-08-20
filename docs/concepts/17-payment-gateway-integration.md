# Payment Gateway Integration

## Overview
Payment gateway integration allows applications to securely process payments by connecting to payment providers like Stripe, PayPal, Square, etc. It handles the complex aspects of payment processing, security, and compliance.

## Benefits
- Secure payment processing with PCI DSS compliance
- Multiple payment method support (credit cards, digital wallets, bank transfers)
- Fraud detection and prevention tools
- Recurring billing and subscription management
- International currency support
- Detailed reporting and analytics
- Refund and dispute handling

## Implementation in Hexa
Hexa demonstrates payment integration concepts in `server/src/services/paymentService.js` with a mock implementation that shows:

### Core Functions:
1. **createPaymentIntent** - Creates a payment intent representing your intention to collect payment
2. **confirmPayment** - Confirms the payment with a payment method
3. **refundPayment** - Processes partial or full refunds
4. **retrievePayment** - Retrieves payment details
5. **testConnection** - Tests payment gateway connectivity

### Security Features:
- Input validation and sanitization
- Payment data never touches application servers (in real implementation)
- Tokenization of sensitive payment information
- Secure webhook endpoints for asynchronous events
- Environment-based configuration for API keys

### Payment Flow:
1. Customer initiates payment (e.g., subscribes to premium plan)
2. Application creates payment intent with amount and currency
3. Customer provides payment details (via payment provider's SDK)
4. Application confirms payment with payment method ID
5. Payment provider processes transaction and notifies application
6. Application updates order/status based on payment result

## PCI DSS Compliance Considerations
- Never store raw card data in your database
- Use payment provider's tokenization services
- Implement strong access controls and monitoring
- Regularly scan for vulnerabilities
- Maintain documented security policies and procedures
- Use HTTPS in production
- Implement proper logging and audit trails

## Webhooks for Asynchronous Events
Payment gateways use webhooks to notify applications of events:
- Payment succeeded/failed
- Dispute initiated
- Subscription created/updated/cancelled
- Refund processed
- Customer information updated

## Example Usage
The payment service would typically be used in controllers like:
```javascript
// Create payment intent
const paymentIntent = await paymentService.createPaymentIntent({
  amount: 1999, // $19.99
  currency: 'usd',
  description: 'Hexa Premium Subscription',
  metadata: { userId: req.user.id }
});

// Confirm payment
const paymentResult = await paymentService.confirmPayment(
  paymentIntent.id,
  { id: 'pm_card_visa' } // Payment method ID from client
);

// Process refund
const refundResult = await paymentService.refundPayment(
  paymentIntent.id,
  999 // $9.99 partial refund
);
```