import '@/components/Toast/toast.css'
import 'react-day-picker/dist/style.css'

import {
  useEffect,
  useMemo
} from 'react'

import Decimal from 'decimal.js'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { shallow } from 'zustand/shallow'

import { DialogManager } from '@/components/DialogManager'
import { OnboardingDialog } from '@/components/Dialogs/OnboardingDialog'
import { useAppStore } from '@/store'
import { setStorageItem } from '@/utils/localStorage'
import { useDisclosure } from '@chakra-ui/react'

const DynamicProviders = dynamic(() => import('@/provider').then((mod) => mod.Providers))
const DynamicContent = dynamic(() => import('@/components/Content'))
const DynamicAppNavLayout = dynamic(() => import('@/components/AppLayout/AppNavLayout'), { ssr: false })

const CONTENT_ONLY_PATH = ['404', '/moonpay']
const OVERFLOW_HIDDEN_PATH = ['/liquidity-pools']

Decimal.set({ precision: 1e3 })

const COLOR_MODE_KEY = 'chakra-ui-color-mode'

const MyApp = ({ Component, pageProps, ...props }: AppProps) => {
  setStorageItem(COLOR_MODE_KEY, 'dark');
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
      await setRpcUrlAct(process.env.NEXT_PUBLIC_RPC_URL || "")
      offLoading()
    }

    setRpcUrl().catch(console.error)
  }, [])

  return (
    <>
      {/* <GoogleAnalytics gaId="G-DR3V6FTKE3" /> */}
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="twitter:image" content="https://sherex.fun/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sherex" />
        <meta name="twitter:creator" content="@sherexcoin" />
        <meta name="twitter:title" content="Queen Sherex" />
        <meta name="twitter:description" content="" />
        <meta property="og:description" content="" />
        <meta property="og:url" content="https://sherex.fun/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sherex.fun/logo.png" />
        <meta property="og:image:alt" content="Queen Sherex" />
        <meta property="og:locale" content="en" />
        <meta property="og:site_name" content="Queen Sherex" />
        <meta property="og:title" content="Queen Sherex" />
        <title>{pageProps?.title ? `${pageProps.title} | Queen Sherex` : 'Queen Sherex'}</title>
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
