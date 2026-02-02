// app/(frontend)/checkout/checkout-form.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/store/cart-store' // Adjust import to your cart store
import { Button } from '@/components/ui/button' // Adjust to your button component
import { Input } from '@/components/ui/input' // Adjust to your input component

// Import myPOS SDK
// Note: This will be loaded via CDN or npm package
declare global {
    interface Window {
        MyPOSEmbedded: any;
    }
}

export default function CheckoutForm() {
    const router = useRouter()
    const cartItems = useCartStore((state) => state.items)
    const clearCart = useCartStore((state) => state.clearCart)

    const [personalInfo, setPersonalInfo] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'BG',
    })

    const [showPaymentForm, setShowPaymentForm] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [orderID, setOrderID] = useState<string | null>(null)
    const [showTermsModal, setShowTermsModal] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false)

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) =>
        sum + (item.price * item.quantity), 0
    )

    // Check if cart has physical products (requires address)
    const hasPhysicalProducts = cartItems.some(
        item => item.productType === 'physical'
    )

    // Load myPOS SDK
    useEffect(() => {
        if (typeof window === 'undefined') return

        // Check if already loaded
        if (window.MyPOSEmbedded) return

        // Load from CDN
        const script = document.createElement('script')
        script.src = 'https://developers.mypos.com/repository/mypos-embedded-sdk.js'
        script.async = true
        script.onload = () => {
            console.log('myPOS SDK loaded')
        }
        script.onerror = () => {
            console.error('Failed to load myPOS SDK')
            toast.error('Failed to load payment system')
        }
        document.body.appendChild(script)

        return () => {
            // Cleanup
            if (script.parentNode) {
                script.parentNode.removeChild(script)
            }
        }
    }, [])

    // Initialize myPOS payment
    const initializePayment = useCallback(async (sessionOrderID: string) => {
        if (!window.MyPOSEmbedded) {
            toast.error('Payment system not ready. Please refresh.')
            return
        }

        const paymentParams = {
            sid: process.env.NEXT_PUBLIC_MYPOS_SID!,
            ipcLanguage: 'en',
            walletNumber: process.env.NEXT_PUBLIC_MYPOS_WALLET_NUMBER!,
            amount: totalAmount,
            currency: 'EUR',
            orderID: sessionOrderID,
            urlNotify: `${window.location.origin}/api/webhooks/mypos`,
            urlOk: `${window.location.origin}/order-confirmation?order_id=${sessionOrderID}`,
            urlCancel: `${window.location.origin}/checkout`,
            keyIndex: 1,
            cartItems: cartItems.map(item => ({
                article: item.title,
                quantity: item.quantity,
                price: item.price,
                currency: 'EUR',
            })),
        }

        const callbackParams = {
            isSandbox: process.env.NEXT_PUBLIC_MYPOS_IS_SANDBOX === 'true',
            onSuccess: function (data: any) {
                console.log('Payment successful:', data)
                clearCart()
                router.push(`/order-confirmation?order_id=${sessionOrderID}`)
            },
            onError: function (error: any) {
                console.error('Payment error:', error)
                toast.error('Payment failed. Please try again.')
                setIsProcessing(false)
            },
            onMessageReceived: function (messages: any) {
                console.log('Payment messages:', messages)
                // You can display these messages to the user if needed
            },
        }

        try {
            await window.MyPOSEmbedded.createPayment(
                'mypos-embedded-checkout',
                paymentParams,
                callbackParams
            )
        } catch (error) {
            console.error('Error initializing payment:', error)
            toast.error('Failed to initialize payment')
            setIsProcessing(false)
        }
    }, [cartItems, totalAmount, clearCart, router])

    // Handle proceed to payment
    const handleProceedToPayment = async () => {
        // Validate required fields
        if (!personalInfo.fullName || !personalInfo.email || !personalInfo.phoneNumber) {
            toast.error('Please fill in all required fields')
            return
        }

        if (hasPhysicalProducts && (!personalInfo.address || !personalInfo.city || !personalInfo.postalCode)) {
            toast.error('Address is required for physical products')
            return
        }

        if (!termsAccepted) {
            setShowTermsModal(true)
            return
        }

        setIsProcessing(true)

        try {
            // Create checkout session
            const response = await fetch('/api/checkout/create-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'USER_ID_HERE', // Get from your auth system
                    cartItems: cartItems,
                    personalInfo: personalInfo,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create checkout session')
            }

            const data = await response.json()
            setOrderID(data.orderID)

            // Show payment form
            setShowPaymentForm(true)

            // Initialize myPOS payment
            await initializePayment(data.orderID)

        } catch (error: any) {
            console.error('Checkout error:', error)
            toast.error(error.message || 'Failed to proceed to payment')
            setIsProcessing(false)
        }
    }

    // Handle terms acceptance
    const handleAcceptTerms = () => {
        setTermsAccepted(true)
        setShowTermsModal(false)
        handleProceedToPayment()
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-2xl mx-auto p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Button onClick={() => router.push('/shop')}>
                    Continue Shopping
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {!showPaymentForm ? (
                        <div className="space-y-6">
                            {/* Personal Information */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={personalInfo.fullName}
                                            onChange={(e) => setPersonalInfo(prev => ({
                                                ...prev,
                                                fullName: e.target.value
                                            }))}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="email"
                                            value={personalInfo.email}
                                            onChange={(e) => setPersonalInfo(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))}
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="tel"
                                            value={personalInfo.phoneNumber}
                                            onChange={(e) => setPersonalInfo(prev => ({
                                                ...prev,
                                                phoneNumber: e.target.value
                                            }))}
                                            placeholder="+359 XXX XXX XXX"
                                            required
                                        />
                                    </div>

                                    {hasPhysicalProducts && (
                                        <>
                                            <div className="pt-4 border-t">
                                                <h3 className="font-medium mb-3">Shipping Address</h3>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Address <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={personalInfo.address}
                                                    onChange={(e) => setPersonalInfo(prev => ({
                                                        ...prev,
                                                        address: e.target.value
                                                    }))}
                                                    placeholder="Street address"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">
                                                        City <span className="text-red-500">*</span>
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        value={personalInfo.city}
                                                        onChange={(e) => setPersonalInfo(prev => ({
                                                            ...prev,
                                                            city: e.target.value
                                                        }))}
                                                        placeholder="Sofia"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1">
                                                        Postal Code <span className="text-red-500">*</span>
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        value={personalInfo.postalCode}
                                                        onChange={(e) => setPersonalInfo(prev => ({
                                                            ...prev,
                                                            postalCode: e.target.value
                                                        }))}
                                                        placeholder="1000"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Country
                                                </label>
                                                <select
                                                    value={personalInfo.country}
                                                    onChange={(e) => setPersonalInfo(prev => ({
                                                        ...prev,
                                                        country: e.target.value
                                                    }))}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                >
                                                    <option value="BG">Bulgaria</option>
                                                    <option value="RO">Romania</option>
                                                    <option value="GR">Greece</option>
                                                    {/* Add more countries as needed */}
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Continue Button */}
                            <Button
                                onClick={() => setShowTermsModal(true)}
                                disabled={isProcessing}
                                className="w-full py-6 text-lg font-semibold"
                                size="lg"
                            >
                                {isProcessing ? 'Processing...' : `Proceed to Payment (€${totalAmount.toFixed(2)})`}
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h2 className="text-xl font-semibold mb-6">Payment</h2>

                            {/* myPOS Embedded Payment Form */}
                            <div
                                id="mypos-embedded-checkout"
                                className="min-h-[620px] min-w-[320px]"
                            />

                            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <span>Secure payment powered by myPOS</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Summary Sidebar */}
                <div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-6">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-4">
                            {cartItems.map((item) => (
                                <div key={item.cartItemId} className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        {item.title} x {item.quantity}
                                    </span>
                                    <span className="font-medium">
                                        €{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>€{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Terms and Conditions</h3>
                        <div className="text-sm text-gray-600 mb-6 max-h-60 overflow-y-auto">
                            <p>By proceeding with this purchase, you agree to our terms and conditions...</p>
                            {/* Add your actual terms here */}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowTermsModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAcceptTerms}
                                className="flex-1"
                            >
                                Accept & Continue
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}