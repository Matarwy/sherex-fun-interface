import type { AppProps } from 'next/app'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import Decimal from 'decimal.js'

import '@/components/Toast/toast.css'
// import '@/components/LandingPage/components/tvl.css'
// import '@/components/LandingPage/liquidity.css'
import 'react-day-picker/dist/style.css'
import { GoogleAnalytics } from '@next/third-parties/google'
import { OnboardingDialog } from '@/components/Dialogs/OnboardingDialog'
import { DialogManager } from '@/components/DialogManager'

const DynamicProviders = dynamic(() => import('@/provider').then((mod) => mod.Providers))
const DynamicContent = dynamic(() => import('@/components/Content'))
const DynamicAppNavLayout = dynamic(() => import('@/components/AppLayout/AppNavLayout'), { ssr: false })

const CONTENT_ONLY_PATH = ['404', '/moonpay']
const OVERFLOW_HIDDEN_PATH = ['/liquidity-pools']

Decimal.set({ precision: 1e3 })

const MyApp = ({ Component, pageProps, ...props }: AppProps) => {
  const { pathname } = useRouter()

  const [onlyContent, overflowHidden] = useMemo(
    () => [CONTENT_ONLY_PATH.includes(pathname), OVERFLOW_HIDDEN_PATH.includes(pathname)],
    [pathname]
  )

  return (
    <>
      <GoogleAnalytics gaId="G-DR3V6FTKE3" />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="twitter:image" content="https://sherex.fun/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sherex" />
        <meta name="twitter:creator" content="@sherexcoin" />
        <meta name="twitter:title" content="sherex.fun" />
        <meta name="twitter:description" content="" />
        <meta property="og:description" content="" />
        <meta property="og:url" content="https://sherex.fun/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sherex.fun/logo.png" />
        <meta property="og:image:alt" content="sherex.fun" />
        <meta property="og:locale" content="en" />
        <meta property="og:site_name" content="sherex.fun" />
        <meta property="og:title" content="sherex.fun" />
        <title>{pageProps?.title ? `${pageProps.title} sherex.fun` : 'sherex.fun'}</title>
      </Head>
      <DynamicProviders>
        <DynamicContent {...props}>
          {onlyContent ? (
            <Component {...pageProps} />
          ) : (
            <DynamicAppNavLayout overflowHidden={overflowHidden}>
              <Component {...pageProps} />
            </DynamicAppNavLayout>
          )}
        </DynamicContent>
        <DialogManager />
        <OnboardingDialog />
      </DynamicProviders>
    </>
  )
}

export default MyApp
