# myPOS Payment Debugging Guide

## Issue Fixed: Amount Must Be in Cents

### Problem
The myPOS SDK was receiving the payment amount in EUR (e.g., `104.00`) instead of cents (e.g., `10400`).

### Solution
Convert all amounts to cents by multiplying by 100:

```typescript
// Before (WRONG)
amount: subtotal, // e.g., 104.00
price: item.price, // e.g., 104.00

// After (CORRECT)
amount: Math.round(subtotal * 100), // e.g., 10400
price: Math.round(item.price * 100), // e.g., 10400
```

---

## Enhanced Debug Logging

The code now includes detailed console logs to help debug payment initialization:

```
🚀 Initializing myPOS payment with params: {
  sid: "000000000000010",
  walletNumber: "61938166610",
  amount: 10400,    // Amount in cents
  amountEUR: 104,   // Original EUR amount (for reference)
  amountCents: 10400,
  currency: "EUR",
  orderID: "...",
  isSandbox: true
}
```

---

## What to Check in Console

1. **Initialization Log** (`🚀`):
   - Verify `amountCents` is correct (EUR × 100)
   - Check `isSandbox` is `true` for testing
   - Confirm SID and walletNumber match your test credentials

2. **Success** (`✅`):
   - Payment completed successfully
   - Redirecting to confirmation page

3. **Error** (`❌`):
   - Payment failed
   - Check error details in console

4. **Messages** (`📨`):
   - myPOS status updates
   - Form validation messages

---

## Next Steps

1. **Refresh the browser** (Ctrl+Shift+R)
2. **Go to /checkout**
3. **Add items and proceed to payment**
4. **Check the console for the 🚀 initialization log**
5. **Verify the parameters look correct**

---

## Expected Behavior

After this fix, you should see:
- Payment form loads in the iframe
- No more generic `{event: 'error'}` messages
- Card input fields appear
- You can enter test card details

**Test Card**:
- Number: `4006092001004`
- CVV: `111`
- 3D Secure: `111111`
- Expiry: Any future date

---

## Common Issues & Solutions

### Issue: Still getting error
**Check**:
- Is `NEXT_PUBLIC_MYPOS_IS_SANDBOX` set to `"true"` (string)?
- Are SID and wallet number correct?
- Is amount > 0?

### Issue: Amount is wrong
**Check**:
- Look at the `🚀` log in console
- `amountCents` should be `amountEUR * 100`
- Example: €104.00 → 10400 cents

### Issue: Form not appearing
**Check**:
- Is the DOM element `#mypos-embedded-checkout` present?
- Check browser console for CSP errors
- Verify myPOS SDK loaded (should see "myPOS SDK loaded")

---

**Status**: Amount Conversion Fixed ✅  
**Enhanced Logging**: Added ✅  
**Ready to Test**: YES 🚀
