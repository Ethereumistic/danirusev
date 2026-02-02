Overview

 

Online Payments
myPOS Checkout is an online payment page solution that allows you to securely accept payments on your e-commerce website. Whenever your customers make a purchase and go to checkout, they’ll be redirected to a myPOS-hosted payment form to complete their payment.

 

myPOS Checkout simplifies online payments by handling the entire payment process and providing a fully-built, intuitive user interface.

 

In addition to being quick and easy to set up, myPOS Checkout also:

Provides a seamless experience for your customers
Ensures the highest level of security with a PCI Compliant API and SSL encryption
Settles the payment into your myPOS account instantly
 

How do the myPOS Online payments work?

## Payment Flow

1. Customer goes to checkout
2. Merchant creates payment request to myPOS
3. myPOS displays secure checkout page
4. Customer selects payment method
5. Customer submits payment data
6. myPOS calls URL_Notify
7. Decision: payment successful?

IF No:
  8. Merchant displays cancellation page with reason
  9. Customer confirms cancellation
  END

IF Yes:
  8. myPOS sends HTTP POST to URL_OK
  9. Merchant displays success screen
 10. Customer lands on success screen
  END


A customer on your website adds product/s to their shopping cart and goes to checkout.

Your website creates a payment request on the myPOS platform by calling the Payments API with the amount, description and the URL where the customer should be redirected back to after the payment is completed.

The customer reaches the hosted checkout page, chooses a payment method and makes the payment. This process is entirely taken care of by myPOS. There is no action required from your side.

When the payment is made, myPOS will do a final check with your website (URL_Notify).

If the payment is successful, myPOS will return the visitor to your website (URL_OK). Your website already knows the payment was successful and thanks the customer.

https://developers-old.mypos.com/en/doc/online_payments/v1_4/5-store-management
https://developers-old.mypos.com/en/doc/online_payments/v1_4/291-checkout-getting-started
https://developers-old.mypos.com/en/doc/online_payments/v1_4/19-the-process
https://developers-old.mypos.com/en/doc/online_payments/v1_4/7-implementation-basics
https://developers-old.mypos.com/en/doc/online_payments/v1_4/16-data-type-formats
https://developers-old.mypos.com/en/doc/online_payments/v1_4/336-authentication
https://developers-old.mypos.com/en/doc/online_payments/v1_4/28-error-messages
https://developers-old.mypos.com/en/doc/online_payments/v1_4/45-card-types
https://developers-old.mypos.com/en/doc/online_payments/v1_4/46-card-verification-
https://developers-old.mypos.com/en/doc/online_payments/v1_4/10-security-and-availability

https://developers-old.mypos.com/en/doc/online_payments/v1_4/20-api-reference
https://developers-old.mypos.com/en/doc/online_payments/v1_4/374-embedded-sdk
https://developers-old.mypos.com/en/doc/online_payments/v1_4/173-testing