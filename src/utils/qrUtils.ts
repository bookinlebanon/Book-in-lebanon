import QRCode from 'qrcode';

/**
 * Generate a QR code data URL representing a listing.
 * Includes the direct URL to the listing on the Book in Lebanon platform.
 */
export async function generateListingQrDataUrl(listingId: string): Promise<string> {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bookinlebanon.com';
    const payload = `${origin}/?listing=${encodeURIComponent(listingId)}`;
    
    return await QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#064e3b', // Rich Lebanese cedar emerald
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.warn('QR code generation error:', err);
    return '';
  }
}

/**
 * Generate a QR code data URL for Lebanese payments (Whish Pay & OMT Pay).
 */
export async function generatePaymentQrDataUrl(
  type: 'whish' | 'omt', 
  amountUSD: number, 
  refCode: string
): Promise<string> {
  try {
    const payload = type === 'whish'
      ? `whishpay://pay?amount=${amountUSD}&currency=USD&ref=${encodeURIComponent(refCode)}&merchant=bookinlebanon`
      : `omtpay://transfer?amount=${amountUSD}&currency=USD&ref=${encodeURIComponent(refCode)}&merchant=bookinlebanon`;

    const darkColor = type === 'whish' ? '#E11D48' : '#0284C7';

    return await QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: darkColor,
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.warn('Payment QR generation error:', err);
    return '';
  }
}
