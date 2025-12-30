'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, ArrowLeft, ScanLine } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useRouter } from 'next/navigation'

export default function VerifyPage() {
    const router = useRouter()
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const qrBoxId = 'qr-reader'

    const startScanning = async () => {
        try {
            setError(null)
            setIsScanning(true)

            // Wait for DOM to update
            await new Promise(resolve => setTimeout(resolve, 100))

            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(qrBoxId)
            }

            await scannerRef.current.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    // Handle successful scan
                    console.log('QR Code scanned:', decodedText)

                    // Stop scanning
                    if (scannerRef.current) {
                        scannerRef.current.stop()
                    }
                    setIsScanning(false)

                    // Extract voucher ID from URL
                    try {
                        const url = new URL(decodedText)

                        // Get current host from window for flexible validation across deployments
                        const currentHost = window.location.host
                        // Check multiple fallback env vars to be resilient for the expected host
                        const siteUrlEnv = process.env.NEXT_PUBLIC_BASE_URL ||
                            process.env.NEXT_PUBLIC_SITE_URL ||
                            process.env.NEXT_PUBLIC_SERVER_URL
                        const expectedHostFromEnv = siteUrlEnv ? new URL(siteUrlEnv).host : null

                        // Validate the QR code is from our domain (either current host OR the configured site URL)
                        const isAuthorizedHost = url.host === currentHost || (expectedHostFromEnv && url.host === expectedHostFromEnv)

                        if (!isAuthorizedHost) {
                            setError(`Невалиден QR код - не е от ${currentHost}`)
                            return
                        }

                        const pathParts = url.pathname.split('/')
                        const verifyIndex = pathParts.indexOf('verify')
                        if (verifyIndex !== -1 && pathParts[verifyIndex + 1]) {
                            const voucherId = pathParts[verifyIndex + 1]
                            router.push(`/dash/verify/${voucherId}`)
                        } else {
                            setError('Невалиден QR код - не е ваучер')
                        }
                    } catch {
                        // Maybe it's just the voucher ID directly
                        if (decodedText.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                            router.push(`/dash/verify/${decodedText}`)
                        } else {
                            setError('Невалиден QR код формат')
                        }
                    }
                },
                () => {
                    // Ignore continuous scanning errors
                }
            )
        } catch (err) {
            console.error('Error starting scanner:', err)
            setError('Грешка при стартиране на камерата. Моля, разрешете достъп до камерата.')
            setIsScanning(false)
        }
    }

    const stopScanning = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop()
            } catch (err) {
                console.error('Error stopping scanner:', err)
            }
        }
        setIsScanning(false)
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { })
            }
        }
    }, [])

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {/* CSS to ensure video displays properly */}
            <style jsx global>{`
                #${qrBoxId} video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    border-radius: 0.75rem;
                }
                #${qrBoxId} {
                    border: none !important;
                }
                #${qrBoxId} > div {
                    border: none !important;
                }
            `}</style>

            {/* Back button */}
            <Button asChild variant="ghost" className="mb-6 text-slate-400 hover:text-white">
                <Link href="/dash">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Назад към Dashboard
                </Link>
            </Button>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="text-center">
                    <div className="mx-auto p-4 rounded-full bg-main/20 w-fit mb-4">
                        <QrCode className="h-8 w-8 text-main" />
                    </div>
                    <CardTitle className="text-2xl font-black text-white">Проверка на ваучер</CardTitle>
                    <p className="text-slate-400 mt-2">Сканирайте QR кода от ваучера на клиента</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Scanner container - Must be visible and have dimensions */}
                    {isScanning ? (
                        <div
                            id={qrBoxId}
                            className="w-full rounded-xl overflow-hidden bg-black"
                            style={{ minHeight: '400px' }}
                        />
                    ) : (
                        <div className="w-full rounded-xl bg-slate-800 flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
                            <ScanLine className="h-16 w-16 text-slate-600 mb-4" />
                            <p className="text-slate-500">Натиснете бутона за да започнете сканиране</p>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Action button */}
                    <Button
                        onClick={isScanning ? stopScanning : startScanning}
                        className={`w-full h-14 text-lg font-bold ${isScanning
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-main hover:bg-main/90 text-black'
                            }`}
                    >
                        {isScanning ? 'Спри сканирането' : 'Започни сканиране'}
                    </Button>

                    {/* Manual entry option */}
                    <div className="text-center pt-4 border-t border-slate-800">
                        <p className="text-slate-500 text-sm mb-2">Или въведете ваучер ID ръчно:</p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                const input = (e.target as HTMLFormElement).elements.namedItem('voucherId') as HTMLInputElement
                                if (input.value.trim()) {
                                    router.push(`/dash/verify/${input.value.trim()}`)
                                }
                            }}
                            className="flex gap-2"
                        >
                            <input
                                name="voucherId"
                                type="text"
                                placeholder="Ваучер ID..."
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-main"
                            />
                            <Button type="submit" variant="outline" className="border-slate-700 hover:bg-slate-800">
                                Провери
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
