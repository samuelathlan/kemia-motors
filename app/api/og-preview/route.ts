import { NextRequest, NextResponse } from 'next/server'

// Whitelist allowed domains for SSRF prevention
const ALLOWED_DOMAINS = [
  'instagram.com',
  'www.instagram.com',
  'google.com',
  'drive.google.com',
]

function isUrlSafe(urlString: string): boolean {
  try {
    const url = new URL(urlString)

    // Block internal/private IPs
    if (
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '0.0.0.0' ||
      url.hostname.startsWith('192.168.') ||
      url.hostname.startsWith('10.') ||
      url.hostname.startsWith('172.')
    ) {
      return false
    }

    // Whitelist allowed domains
    const isDomainAllowed = ALLOWED_DOMAINS.some((domain) =>
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    )

    if (!isDomainAllowed) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Security: validate URL
    if (!isUrlSafe(url)) {
      return NextResponse.json({ error: 'Invalid or blocked URL' }, { status: 403 })
    }

    // Fetch with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Kemia Motors)',
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch URL', image: null },
        { status: response.status }
      )
    }

    const html = await response.text()

    // Extract og:image from meta tags
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
    const image = ogImageMatch ? ogImageMatch[1] : null

    return NextResponse.json({ image, url })
  } catch (error) {
    console.error('Error fetching OG preview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preview', image: null },
      { status: 500 }
    )
  }
}
