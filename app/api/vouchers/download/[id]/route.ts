import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { PDFDocument, rgb, degrees } from 'pdf-lib'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'
import fontkit from '@pdf-lib/fontkit'
import { getExperienceThemeColor, getThemeRGB } from '@/lib/utils'

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

        // SECURITY: Verify the voucher belongs to the current user
        if (voucher.user_id !== user.id) {
            console.warn(`[Security] User ${user.id} attempted to download voucher ${voucherId} belonging to user ${voucher.user_id}`)
            return NextResponse.json({ error: 'Forbidden: This voucher does not belong to you' }, { status: 403 })
        }

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

        // Register fontkit
        pdfDoc.registerFontkit(fontkit)

        // Load custom font for brand consistency (Geist Black)
        const fontFile = path.join(process.cwd(), 'public', 'fonts', 'Geist-Black.ttf')
        const fontBytes = fs.readFileSync(fontFile)
        const customFont = await pdfDoc.embedFont(fontBytes)

        // Generate QR code with verification URL
        // Check multiple fallback env vars to be resilient
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            process.env.NEXT_PUBLIC_SERVER_URL ||
            'http://localhost:3000'

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
        console.log(`PDF Dimensions: ${width}x${height}`)

        // Position QR code in top-right corner with specific padding
        const qrSize = 150
        const paddingRight = 40
        const paddingTop = 30

        firstPage.drawImage(qrImage, {
            x: width - qrSize - paddingRight,
            y: height - qrSize - paddingTop,
            width: qrSize,
            height: qrSize
        })

        // Determine theme color and RGB values
        const themeColor = getExperienceThemeColor(voucher.product_slug)
        const [r, g, b] = getThemeRGB(themeColor)
        const themeRgbColor = rgb(r, g, b)

        // Draw Recipient Name at specific coordinates
        // Design is 1920x1080, but PDF reports 1440x810 (Scale: 0.75)
        const scale = width / 1920;
        const recipientName = (voucher.voucher_recipient_name || 'GUEST').toUpperCase()
        const fontSize = 104 * scale
        const posX = 680 * scale
        const posY = 146 * scale // Moved 3px lower (149 -> 146)

        console.log(`Drawing name: "${recipientName}" in theme ${themeColor} at (${posX}, ${posY})`)

        firstPage.drawText(recipientName, {
            x: posX,
            y: posY,
            size: fontSize,
            font: customFont,
            color: rgb(1, 1, 1)
        })

        // Draw Expiry Date in bottom right
        const expiryDate = new Date(voucher.expiry_date).toLocaleDateString('bg-BG')
        const expiryText = `ВАЖИ ДО: ${expiryDate}`.toUpperCase()
        const expiryFontSize = 24 * scale
        const expiryTextWidth = customFont.widthOfTextAtSize(expiryText, expiryFontSize)

        firstPage.drawText(expiryText, {
            x: width - expiryTextWidth - 40,
            y: 55,
            size: expiryFontSize,
            font: customFont,
            color: themeRgbColor
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
