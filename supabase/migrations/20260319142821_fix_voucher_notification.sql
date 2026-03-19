-- Function: get_voucher_notification_details
CREATE OR REPLACE FUNCTION public.get_voucher_notification_details(p_voucher_id uuid)
 RETURNS TABLE(user_email text, user_full_name text, expiry_date date, recipient_name text, experience_title text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(p.email, v.customer_email) as user_email,
        COALESCE(p.full_name, v.voucher_recipient_name, 'Клиент') as user_full_name,
        v.expiry_date,
        v.voucher_recipient_name as recipient_name,
        v.product_slug as experience_title
    FROM ecommerce.vouchers v
    LEFT JOIN ecommerce.profiles p ON v.user_id = p.id
    WHERE v.id = p_voucher_id;
END;
$function$
;
