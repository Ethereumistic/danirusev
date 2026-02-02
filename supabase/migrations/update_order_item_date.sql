-- Migration: Sync Order Item Dates with Voucher Confirmations
-- This ensures order_items.selected_date stays in sync when admin confirms dates

-- Function to update order item's selected date
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

COMMENT ON FUNCTION update_order_item_date IS 'Updates the selected_date of an order item when admin confirms a new date';
