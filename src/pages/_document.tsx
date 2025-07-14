import { theme } from '@/theme'
import { ColorModeScript } from '@chakra-ui/react'
import NextDocument, { Html, Main, Head, NextScript } from 'next/document'
import Script from 'next/script'

/**
 * @see https://chakra-ui.com/docs/styled-system/color-mode#for-nextjs
 */
export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en" suppressHydrationWarning>
        <Head>
          {/* <Script src="/charting_library/charting_library.js" strategy="beforeInteractive"></Script> */}
        </Head>
        <body>
          {/* 👇 Here's the script */}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
