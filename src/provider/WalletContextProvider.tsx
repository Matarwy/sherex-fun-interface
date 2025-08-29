import { createContext, FC, PropsWithChildren, useContext, useEffect } from 'react'
import React, { useMemo, useState } from 'react'

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { ExodusWalletAdapter } from '@solana/wallet-adapter-exodus'
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope'
import { SolflareWalletAdapter, initialize } from '@solflare-wallet/wallet-adapter'
import {
  PhantomWalletAdapter,
  TorusWalletAdapter,
  TrustWalletAdapter,
  // LedgerWalletAdapter,
  MathWalletAdapter,
  TokenPocketWalletAdapter,
  CoinbaseWalletAdapter,
  SolongWalletAdapter,
  Coin98WalletAdapter,
  SafePalWalletAdapter,
  BitpieWalletAdapter,
  BitgetWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { useAppStore, defaultNetWork, defaultEndpoint } from '../store/useAppStore'
import { registerMoonGateWallet } from '@moongate/moongate-adapter'
import { TipLinkWalletAdapter } from '@tiplink/wallet-adapter'
import { WalletConnectWalletAdapter } from '@walletconnect/solana-adapter'

import { type Adapter, type WalletError } from '@solana/wallet-adapter-base'
import { sendWalletEvent } from '@/api/event'
import { useEvent } from '@/hooks/useEvent'
import { LedgerWalletAdapter } from './Ledger/LedgerWalletAdapter'
import CustomWalletModal from '@/components/SolWallet/CustomWalletModal'

initialize()

interface WalletProviderProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the User context with a default value
const WalletContext = createContext<WalletProviderProps | undefined>(undefined);

const WalletContextProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [network] = useState<WalletAdapterNetwork>(defaultNetWork)
  const rpcNodeUrl = useAppStore((s) => s.rpcNodeUrl)
  const wsNodeUrl = useAppStore((s) => s.wsNodeUrl)
  // const [endpoint] = useState<string>(defaultEndpoint)
  const [endpoint, setEndpoint] = useState<string>(rpcNodeUrl || defaultEndpoint)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  registerMoonGateWallet({
    authMode: 'Ethereum',
    position: 'top-right'
    // logoDataUri: 'OPTIONAL ADD IN-WALLET LOGO URL HERE',
    // buttonLogoUri: 'ADD OPTIONAL LOGO FOR WIDGET BUTTON HERE'
  })
  registerMoonGateWallet({
    authMode: 'Google',
    position: 'top-right'
    // logoDataUri: 'OPTIONAL ADD IN-WALLET LOGO URL HERE',
    // buttonLogoUri: 'ADD OPTIONAL LOGO FOR WIDGET BUTTON HERE'
  })
  registerMoonGateWallet({
    authMode: 'Twitter',
    position: 'top-right'
    // logoDataUri: 'OPTIONAL ADD IN-WALLET LOGO URL HERE',
    // buttonLogoUri: 'ADD OPTIONAL LOGO FOR WIDGET BUTTON HERE'
  })
  registerMoonGateWallet({
    authMode: 'Apple',
    position: 'top-right'
    // logoDataUri: 'OPTIONAL ADD IN-WALLET LOGO URL HERE',
    // buttonLogoUri: 'ADD OPTIONAL LOGO FOR WIDGET BUTTON HERE'
  })

  const _walletConnect = useMemo(() => {
    const connectWallet: WalletConnectWalletAdapter[] = []
    try {
      connectWallet.push(
        new WalletConnectWalletAdapter({
          network: network as WalletAdapterNetwork.Mainnet,
          options: {
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PJ_ID || '887686ad41c2e08e696c7536ab80897f',
            metadata: {
              name: 'Sherex.fun',
              description: 'Sherex.fun',
              url: 'https://sherex.fun/',
              icons: ['https://sherex.fun/logo.png']
            }
          }
        })
      )
    } catch (e) {
      // console.error('WalletConnect error', e)
    }
    return connectWallet
  }, [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      // new SlopeWalletAdapter({ endpoint }),
      // new TorusWalletAdapter(),
      // new LedgerWalletAdapter(),
      // ..._walletConnect,
      // new GlowWalletAdapter(),
      // new TrustWalletAdapter(),
      // new MathWalletAdapter({ endpoint }),
      // new TokenPocketWalletAdapter(),
      // new CoinbaseWalletAdapter({ endpoint }),
      // new SolongWalletAdapter({ endpoint }),
      // new Coin98WalletAdapter({ endpoint }),
      // new SafePalWalletAdapter({ endpoint }),
      // new BitpieWalletAdapter({ endpoint }),
      // new BitgetWalletAdapter({ endpoint }),
      // new ExodusWalletAdapter({ endpoint }),
      // new TipLinkWalletAdapter({
      //   clientId: process.env.NEXT_PUBLIC_WALLET_TIP_WALLET_KEY ?? '',
      //   title: 'Queen Sherex',
      //   theme: 'system',
      // }) as unknown as Adapter
    ],
    [network, endpoint]
  )

  useEffect(() => {
    if (rpcNodeUrl) setEndpoint(rpcNodeUrl)
  }, [rpcNodeUrl])

  useEffect(() => {
    console.log("isModalOpen", isModalOpen)
  }, [isModalOpen])

  const onWalletError = useEvent((error: WalletError, adapter?: Adapter) => {
    if (!adapter) return
    sendWalletEvent({
      type: 'connectWallet',
      walletName: adapter.name,
      connectStatus: 'failure',
      errorMsg: error.message || error.stack
    })
  })

  return (
    <WalletContext.Provider value={{ isModalOpen, setIsModalOpen }}>
      <ConnectionProvider endpoint={endpoint} config={{ disableRetryOnRateLimit: true, wsEndpoint: wsNodeUrl }}>
        <WalletProvider wallets={wallets} onError={onWalletError} autoConnect>
          {children}
          <CustomWalletModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </WalletProvider>
      </ConnectionProvider>
    </WalletContext.Provider>
  )
}

export default WalletContextProvider


export const useWalletProvider = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletProvider must be used within a WalletProvider");
  }
  return context;
};
