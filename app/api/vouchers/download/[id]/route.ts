import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { PDFDocument } from 'pdf-lib'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

interface DownloadRouteProps {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: DownloadRouteProps) {
    try {
        const { id: voucherId } = await params
        const supabase = await createClient()

        // Verify user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get voucher details
        const { data: vouchers, error } = await supabase.rpc('get_voucher_by_id', {
            p_voucher_id: voucherId
        })

        if (error || !vouchers || vouchers.length === 0) {
            return NextResponse.json({ error: 'Voucher not found' }, { status: 404 })
        }

        const voucher = vouchers[0]

        // Verify the voucher belongs to the current user (or user is admin - could add role check)
        // For now, allow any authenticated user to download if they have the ID

        // Determine which PDF template to use
        const pdfMap: Record<string, string> = {
            'drift-taxi': 'drift-taxi.pdf',
            'drift-rent': 'drift-rent.pdf',
            'drift-mix': 'drift-mix.pdf'
        }

        const pdfFileName = pdfMap[voucher.product_slug] || 'drift-taxi.pdf'
        const pdfPath = path.join(process.cwd(), 'public', 'vouchers', pdfFileName)

        if (!fs.existsSync(pdfPath)) {
            console.error('PDF template not found:', pdfPath)
            return NextResponse.json({ error: 'PDF template not found' }, { status: 500 })
        }

        // Load the base PDF template
        const existingPdfBytes = fs.readFileSync(pdfPath)
        const pdfDoc = await PDFDocument.load(existingPdfBytes)

        // Generate QR code with verification URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const verifyUrl = `${baseUrl}/dash/verify/${voucherId}`

        const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
            width: 150,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })

        // Embed QR code on the first page (top-right corner)
        const qrImageBytes = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64')
        const qrImage = await pdfDoc.embedPng(qrImageBytes)

        const pages = pdfDoc.getPages()
        const firstPage = pages[0]
        const { width, height } = firstPage.getSize()

        // Position QR code in top-right corner with padding
        const qrSize = 100
        const padding = 30
        firstPage.drawImage(qrImage, {
            x: width - qrSize - padding,
            y: height - qrSize - padding,
            width: qrSize,
            height: qrSize
        })

        // Save the modified PDF
        const modifiedPdfBytes = await pdfDoc.save()
        const pdfBuffer = Buffer.from(modifiedPdfBytes)

        // Return the PDF as a downloadable file
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="voucher-${voucherId.slice(0, 8)}.pdf"`,
                'Content-Length': pdfBuffer.length.toString()
            }
        })

    } catch (error) {
        console.error('Error generating voucher PDF:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
