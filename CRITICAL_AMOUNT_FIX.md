# myPOS Amount Format - The Real Answer 🔍

## 🚨 **IMPORTANT DISCOVERY**

Based on myPOS official documentation, the `amount` parameter should be in **decimal EUR format** (e.g., `234.00`), **NOT cents** (e.g., `23400`).

---

## ❌ **Current Issue**

We're currently sending:
```javascript
amount: 23400  // This is being interpreted as 23,400 EUR!
```

**This is WRONG!** 😱

---

## ✅ **Correct Format**

We should be sending:
```javascript
amount: 234.00  // This is correct: 234 EUR
```

---

## 📚 **myPOS Documentation Evidence**

From myPOS IPC API docs:
- **Type**: `N(18,2)` - Numeric with 2 decimal places
- **Example**: `23.45` (represents €23.45)
- **Format**: Standard currency unit with decimal point

**Sources**:
- myPOS Send Money API: Uses `23.45` format
- myPOS Payment Button: Uses decimal separator '.'
- Currency specified separately via ISO 4217 code ("EUR")

---

## 🔧 **What We Need to Fix**

### File: `app/(frontend)/checkout/checkout-form.tsx`

**Current (WRONG)**:
```typescript
const amountInCents = Math.round(subtotal * 100)  // 234 → 23400

const paymentParams = {
    amount: amountInCents,  // ❌ Sends 23400 (interpreted as 23,400 EUR!)
    // ...
}
```

**Correct**:
```typescript
const paymentParams = {
    amount: subtotal,  // ✅ Sends 234 (234 EUR)
    // ...
}
```

### For Cart Items:
**Current (WRONG)**:
```typescript
cartItems: items.map(item => ({
    article: item.title,
    quantity: item.quantity,
    price: Math.round(item.price * 100),  // ❌ Wrong!
    currency: 'EUR',
}))
```

**Correct**:
```typescript
cartItems: items.map(item => ({
    article: item.title,
    quantity: item.quantity,
    price: item.price,  // ✅ Use decimal price directly
    currency: 'EUR',
}))
```

---

## 🧪 **How This Affects Things**

### If myPOS Actually Charges Based on Amount:

| What We Send | What myPOS Charges | Impact |
|-------------|-------------------|---------|
| `23400` (current) | **23,400 EUR** 😱 | DISASTER - 100x overcharge! |
| `234` (correct) | **234 EUR** ✅ | Perfect! |

### Current Situation (Test Environment):
- We send: `23400`
- myPOS shows: "23400 EUR" (exactly what we sent)
- **This is NOT a UI bug - this is what we're actually sending!**

### What's Saving Us (Maybe):
The sandbox might have validation that prevents ridiculously high amounts, or test cards don't actually charge. **But in production, this would be a MAJOR issue!**

---

## 🎯 **Action Required**

1. **Fix the amount format** to use decimal EUR
2. **Test again** in sandbox
3. **Verify** the display shows 234 EUR correctly
4. **Check webhook** receives amount in correct format

---

## 🔐 **Why We Got Confused**

Many payment processors (Stripe, PayPal) use **cents** to avoid floating-point issues:
- Stripe: `2340` = $23.40
- PayPal: `2340` = $23.40

**But myPOS uses decimal EUR directly:**
- myPOS: `23.40` = €23.40

---

## ⚠️ **Bottom Line**

**We need to change the amount format from cents to decimal EUR before this goes to production!**

Otherwise, a 234 EUR purchase would charge **23,400 EUR** (€23,400)! 😱

---

**Next Step**: Fix the checkout form to use decimal amounts!
