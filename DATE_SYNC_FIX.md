# Date Confirmation Fix Summary 📅

## 🔍 **The Problem**

When an admin confirms an event date:
1. A voucher is created with the **confirmed date** in `ecommerce.vouchers.selected_date`
2. BUT the **order item** still shows the **original date** in `ecommerce.order_items.selected_date`
3. Customer sees the **WRONG date** on their orders page (line 169 in `orders-list.tsx`)

---

## 📊 **Current Data Flow**

### On Checkout:
```
Customer selects date → stored in order_items.selected_date
```

### On Admin Confirmation:
```
Admin confirms new date → stored in vouchers.selected_date
                       → order_items.selected_date NOT UPDATED ❌
```

### On Orders Page:
```
Display: item.selected_date (from order_items) ← WRONG! Shows old date
```

---

## ✅ **The Solution**

We need to update `order_items.selected_date` when a voucher is confirmed with a new date.

### **Option 1: Update in API** (Recommended)
Modify `app/api/orders/confirm-date/route.ts` to also update the order_item.

### **Option 2: Update in Display Logic**
Modify `orders-list.tsx` to prefer voucher date over order_item date.

### **Option 3: Database Trigger** (Best long-term)
Create a trigger that automatically syncs dates.

---

## 🔧 **Recommended Fix: API Update**

### File: `app/api/orders/confirm-date/route.ts`

**Current flow**:
1. Calls `confirm_order_date` RPC (updates order status)
2. Creates voucher with new date
3. ❌ Doesn't update order_item

**New flow**:
1. Calls `confirm_order_date` RPC
2. **Updates `order_items.selected_date`** ✅
3. Creates voucher with new date

---

## 🎯 **Implementation Steps**

### Step 1: Create RPC Function to Update Order Item Date

```sql
-- File: supabase/migrations/update_order_item_date.sql

CREATE OR REPLACE FUNCTION update_order_item_date(
    p_order_item_id INTEGER,
    p_selected_date TIMESTAMPTZ
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE ecommerce.order_items
    SET selected_date = p_selected_date
    WHERE id = p_order_item_id;
END;
$$;
```

### Step 2: Update API to Call This Function

In `app/api/orders/confirm-date/route.ts`, add this BEFORE creating the voucher:

```typescript
// Update the order_item's selected_date if a new date provided
if (selectedDate && orderItemId) {
    const { error: updateError } = await supabase.rpc('update_order_item_date', {
        p_order_item_id: parseInt(orderItemId),
        p_selected_date: selectedDate
    });
    
    if (updateError) {
        console.error('Error updating order item date:', updateError);
    }
}
```

---

## 🚨 **About stripe_payment_intent_id**

This field is being **reused** for different purposes:

### For Stripe Orders (old):
```
stripe_payment_intent_id = "pi_123456..."
```

### For myPOS Orders (current):
```
stripe_payment_intent_id = TransactionID (e.g., "920996")
```

### For Manual Orders:
```
stripe_payment_intent_id = "manual_1770034810610_dedb4079"
```

**This is fine!** It's just an identifier for the payment transaction. The field name is misleading but the usage is correct.

### Consider Renaming (Future):
```sql
ALTER TABLE ecommerce.orders 
RENAME COLUMN stripe_payment_intent_id TO payment_transaction_id;
```

---

## 📝 **Quick Fix (Option 2 - Display Logic)**

If you want a **faster fix without migration**, update the display logic:

### File: `app/(frontend)/orders/orders-list.tsx`

**Line 169**, change:
```typescript
// OLD (shows original date):
const selectedDate = item.selected_date ? new Date(item.selected_date) : undefined

// NEW (prefer voucher date if exists):
const selectedDate = item.voucher_id 
    ? (await getVoucherDate(item.voucher_id)) // needs API call
    : (item.selected_date ? new Date(item.selected_date) : undefined)
```

**Problem**: This requires an API call for each item, which is slow.

---

## 🎯 **Best Approach: Combined Fix**

1. **Update RPC** - Add `update_order_item_date` function
2. **Update API** - Call it when confirming dates
3. **Verify** - Test that customers see correct date

This ensures:
- ✅ Order items stay in sync with vouchers
- ✅ No extra API calls on display
- ✅ Data integrity maintained

---

## 🧪 **Testing Steps**

After implementing the fix:

1. **Create test order** with initial date (e.g., Jan 15)
2. **Confirm order** with new date (e.g., Feb 20)
3. **Check database**:
   ```sql
   SELECT oi.selected_date as order_item_date,
          v.selected_date as voucher_date
   FROM ecommerce.order_items oi
   LEFT JOIN ecommerce.vouchers v ON v.order_item_id = oi.id
   WHERE oi.id = <test_item_id>;
   ```
4. **Check orders page** - Should show Feb 20 ✅

---

**Next Step**: Implement the RPC function and update the API! 🚀
