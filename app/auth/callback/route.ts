import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorMessage = errorDescription || error
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(errorMessage)}`
    )
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('認証に失敗しました。再度お試しください。')}`
        )
      }

      // Get redirect URL from state parameter or default to dashboard
      const state = requestUrl.searchParams.get('state')
      let redirectTo = '/dashboard'
      
      if (state) {
        try {
          const stateData = JSON.parse(decodeURIComponent(state))
          redirectTo = stateData.redirectTo || '/dashboard'
        } catch (e) {
          // If state parsing fails, use default redirect
          redirectTo = '/dashboard'
        }
      }

      return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('予期しないエラーが発生しました。')}`
      )
    }
  }

  // No code parameter, redirect to login with error
  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=${encodeURIComponent('認証パラメータが見つかりません。')}`
  )
}