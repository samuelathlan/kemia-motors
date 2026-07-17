import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Fetch the page and extract OG image
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Kemia Motors)',
      },
    })

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
