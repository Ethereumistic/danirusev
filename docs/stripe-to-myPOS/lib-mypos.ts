// lib/mypos.ts
import crypto from 'crypto';

/**
 * myPOS Configuration
 * Get these values from your myPOS merchant dashboard
 */
export const myPOSConfig = {
    sid: process.env.MYPOS_SID!,
    walletNumber: process.env.MYPOS_WALLET_NUMBER!,
    keyIndex: parseInt(process.env.MYPOS_KEY_INDEX || '1'),
    privateKey: process.env.MYPOS_PRIVATE_KEY!,
    publicKey: process.env.MYPOS_PUBLIC_KEY!,
    isSandbox: process.env.NEXT_PUBLIC_MYPOS_IS_SANDBOX === 'true',
    currency: 'EUR',
    ipcLanguage: 'en',
};

/**
 * Generate RSA-SHA256 signature for myPOS requests
 * @param data - Data string to sign (parameters concatenated with &)
 * @returns Base64 encoded signature
 */
export function generateSignature(data: string): string {
    try {
        const sign = crypto.createSign('SHA256');
        sign.update(data);
        sign.end();
        return sign.sign(myPOSConfig.privateKey, 'base64');
    } catch (error) {
        console.error('Error generating signature:', error);
        throw new Error('Failed to generate signature');
    }
}

/**
 * Verify RSA-SHA256 signature from myPOS webhooks
 * @param data - Data string to verify
 * @param signature - Base64 encoded signature
 * @returns True if signature is valid
 */
export function verifySignature(data: string, signature: string): boolean {
    try {
        const verify = crypto.createVerify('SHA256');
        verify.update(data);
        verify.end();
        return verify.verify(myPOSConfig.publicKey, signature, 'base64');
    } catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
}

/**
 * Build data string for signature generation
 * Keys must be sorted alphabetically
 */
export function buildDataString(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    return sortedKeys
        .map(key => `${key}=${params[key]}`)
        .join('&');
}

/**
 * Cart item for myPOS payment
 */
export interface MyPOSCartItem {
    article: string;
    quantity: number;
    price: number;
    currency: string;
}

/**
 * Payment parameters for myPOS Embedded SDK
 */
export interface MyPOSPaymentParams {
    sid: string;
    ipcLanguage: string;
    walletNumber: string;
    amount: number;
    currency: string;
    orderID: string;
    urlNotify: string;
    urlOk: string;
    urlCancel: string;
    keyIndex: number;
    cartItems: MyPOSCartItem[];
    customerEmail?: string;
    customerFirstNames?: string;
    customerFamilyName?: string;
    customerPhone?: string;
    customerCountry?: string;
    customerCity?: string;
    customerZIPCode?: string;
    customerAddress?: string;
}

/**
 * Callback parameters for myPOS Embedded SDK
 */
export interface MyPOSCallbackParams {
    isSandbox: boolean;
    onSuccess: (data: any) => void;
    onError: (error?: any) => void;
    onMessageReceived?: (messages: any) => void;
}

/**
 * Webhook response from myPOS
 */
export interface MyPOSWebhookData {
    IPCmethod: string;
    OrderID: string;
    Amount: string;
    Currency: string;
    CustomerEmail?: string;
    CustomerFirstNames?: string;
    CustomerFamilyName?: string;
    CustomerPhone?: string;
    CustomerCountry?: string;
    CustomerCity?: string;
    CustomerZIPCode?: string;
    CustomerAddress?: string;
    TransactionStatus: string; // '1' = success, '2' = pending, '0' = failed
    TransactionID: string;
    CardType?: string;
    CardLast4Digits?: string;
    Signature: string;
    [key: string]: string | undefined;
}

/**
 * Parse myPOS webhook form data
 */
export function parseWebhookData(formData: FormData): MyPOSWebhookData {
    const data: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
        data[key] = value.toString();
    }

    return data as MyPOSWebhookData;
}

/**
 * Validate myPOS webhook
 * @returns Object with isValid and data/error
 */
export function validateWebhook(webhookData: MyPOSWebhookData): {
    isValid: boolean;
    error?: string;
} {
    // Extract signature
    const { Signature, ...dataWithoutSignature } = webhookData;

    if (!Signature) {
        return { isValid: false, error: 'Missing signature' };
    }

    // Build data string for verification
    const dataString = buildDataString(dataWithoutSignature);

    // Verify signature
    const isValid = verifySignature(dataString, Signature);

    if (!isValid) {
        return { isValid: false, error: 'Invalid signature' };
    }

    // Check transaction status
    if (webhookData.TransactionStatus !== '1') {
        return {
            isValid: true, // signature is valid, but payment failed
            error: `Payment not successful. Status: ${webhookData.TransactionStatus}`
        };
    }

    return { isValid: true };
}

/**
 * Generate unique order ID
 */
export function generateOrderID(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `order_${timestamp}_${random}`;
}

/**
 * Format cart items for myPOS
 * Converts your internal cart structure to myPOS format
 */
export function formatCartItems(cartItems: any[]): MyPOSCartItem[] {
    return cartItems.map(item => ({
        article: item.title || item.name,
        quantity: item.quantity,
        price: item.price,
        currency: 'EUR',
    }));
}

/**
 * Calculate total amount from cart items
 */
export function calculateTotal(cartItems: MyPOSCartItem[]): number {
    return cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

/**
 * Test configuration (from myPOS documentation)
 */
export const TEST_CONFIG = {
    sid: '000000000000010',
    walletNumber: '61938166610',
    keyIndex: 1,
    testCardNumber: '4006092001004',
    testCVV: '111',
    test3DSecurePassword: '111111',
};

export default myPOSConfig;