import type { AppProps } from 'next/app'
import Script from 'next/script';
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import Decimal from 'decimal.js'


import '@/components/Toast/toast.css'
// import '@/components/LandingPage/components/tvl.css'
// import '@/components/LandingPage/liquidity.css'
import 'react-day-picker/dist/style.css'
import { GoogleAnalytics } from '@next/third-parties/google'
import { OnboardingDialog } from '@/components/Dialogs/OnboardingDialog'
import { DialogManager } from '@/components/DialogManager'
import { useDisclosure } from '@chakra-ui/react'
import { useAppStore } from '@/store'
import shallow from 'zustand/shallow'

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

  const [setRpcUrlAct] = useAppStore((s) => [s.setRpcUrlAct], shallow)
  const { onOpen: onLoading, onClose: offLoading } = useDisclosure()

  useEffect(() => {
    const setRpcUrl = async () => {
      onLoading()
      await setRpcUrlAct('https://mainnet.helius-rpc.com/?api-key=1595a210-c001-4e74-a596-ba8a420c7828') //https://mainnet.helius-rpc.com/?api-key=1595a210-c001-4e74-a596-ba8a420c7828
      offLoading()
    }

    setRpcUrl().catch(console.error)
  }, [])

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
              {/* Inline setup for window.si */}
              <Script id="vercel-si-init" strategy="beforeInteractive">
                {`
                  window.si = window.si || function () {
                    (window.siq = window.siq || []).push(arguments);
                  };
                `}
              </Script>

              {/* External script */}
              <Script
                src="/_vercel/speed-insights/script.js"
                strategy="afterInteractive"
                defer
              />

              {/* Inline setup for window.va */}
              <Script id="vercel-analytics-init" strategy="beforeInteractive">
                {`
                  window.va = window.va || function () {
                    (window.vaq = window.vaq || []).push(arguments);
                  };
                `}
              </Script>

              {/* Vercel Analytics script */}
              <Script
                src="/_vercel/insights/script.js"
                strategy="afterInteractive"
                defer
              />
              
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
