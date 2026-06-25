import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/worker/')) {
    const secret = process.env.CRON_SECRET
    const auth = request.headers.get('authorization')
    const querySecret = request.nextUrl.searchParams.get('secret')

    if (!secret || (auth !== `Bearer ${secret}` && querySecret !== secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/worker/:path*',
}
