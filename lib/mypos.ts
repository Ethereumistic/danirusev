// lib/mypos.ts
import crypto from 'crypto';

/**
 * myPOS Configuration
 */
export const myPOSConfig = {
    sid: process.env.MYPOS_SID!,
    walletNumber: process.env.MYPOS_WALLET_NUMBER!,
    keyIndex: parseInt(process.env.MYPOS_KEY_INDEX || '1'),
    privateKey: process.env.MYPOS_PRIVATE_KEY!,
    publicKey: process.env.MYPOS_PUBLIC_KEY!,
    isSandbox: process.env.NEXT_PUBLIC_MYPOS_IS_SANDBOX === 'true',
    currency: 'EUR',
    ipcLanguage: 'bg',
};

/**
 * Build concatenated data string for myPOS signing
 * According to docs: Concatenate values with a dash (-) and then Base64 encode.
 */
function buildConcatString(params: Record<string, any>, keys: string[]): string {
    return keys.map(key => {
        const val = params[key];
        return (val !== undefined && val !== null) ? val.toString() : '';
    }).join('-');
}

/**
 * Verify RSA-SHA256 signature
 */
export function verifySignature(data: string, signature: string): boolean {
    try {
        const verify = crypto.createVerify('SHA256');
        verify.update(data);
        return verify.verify(myPOSConfig.publicKey, signature, 'base64');
    } catch (error) {
        console.error('[MYPOS_SIGN] Error during verification:', error);
        return false;
    }
}

/**
 * Validate myPOS webhook
 */
export function validateWebhook(webhookData: MyPOSWebhookData): {
    isValid: boolean;
    error?: string;
} {
    const { Signature, _orderedKeys, ...params } = webhookData as any;

    if (!Signature) {
        return { isValid: false, error: 'Missing signature' };
    }

    // myPOS Signature logic:
    // 1. Concatenate all data (except Signature) with a dash "-"
    // 2. Base64 encode the resulting string
    // 3. Verify the signature against this Base64 string using RSA-SHA256

    // Strategy 1: Use the order received in POST request (Preferred)
    if (_orderedKeys && _orderedKeys.length > 0) {
        const raw = buildConcatString(params, _orderedKeys);
        const base64 = Buffer.from(raw).toString('base64');

        console.log(`[MYPOS_SIGN] Attempting strategy: Received Order`);
        console.log(`[MYPOS_SIGN] Raw String: "${raw}"`);

        if (verifySignature(base64, Signature)) {
            console.log('✅ Signature valid via Received Order strategy');
            return { isValid: true };
        }
    }

    // Strategy 2: Official Field Order from Docs (Fallback)
    const officialNotifyFields = [
        'IPCmethod', 'SID', 'Amount', 'Currency', 'OrderID',
        'IPC_Trnref', 'RequestDateTime', 'RequestSTAN',
        'PaymentMethod', 'BillingDescriptor', 'PAN'
    ];

    // Filter out missing fields to avoid extra dashes
    const existingOfficial = officialNotifyFields.filter(f => params[f] !== undefined);
    const rawOfficial = buildConcatString(params, existingOfficial);
    const base64Official = Buffer.from(rawOfficial).toString('base64');

    console.log(`[MYPOS_SIGN] Attempting strategy: Official Sequence`);
    if (verifySignature(base64Official, Signature)) {
        console.log('✅ Signature valid via Official Sequence strategy');
        return { isValid: true };
    }

    // Strategy 3: Try without dash (some old implementations/documents)
    const rawNoDash = existingOfficial.map(f => params[f]).join('');
    const base64NoDash = Buffer.from(rawNoDash).toString('base64');
    if (verifySignature(base64NoDash, Signature)) {
        console.log('✅ Signature valid via No-Dash strategy');
        return { isValid: true };
    }

    return { isValid: false, error: 'Invalid signature. Handshake failed.' };
}

export interface MyPOSWebhookData {
    IPCmethod: string;
    OrderID: string;
    Amount: string;
    Currency: string;
    Signature: string;
    [key: string]: string | undefined;
}

export function parseWebhookData(formData: FormData): MyPOSWebhookData {
    const data: Record<string, string> = {};
    const keys: string[] = [];

    // Important: capture the exact order of keys in the form data
    for (const [key, value] of Array.from(formData.entries())) {
        data[key] = value.toString();
        if (key !== 'Signature') {
            keys.push(key);
        }
    }

    return { ...data, _orderedKeys: keys } as any;
}

// ... other utilities
export function generateSignature(data: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    return sign.sign(myPOSConfig.privateKey, 'base64');
}

export function generateOrderID(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export default myPOSConfig;
