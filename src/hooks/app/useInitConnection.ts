import { useCallback, useEffect, useRef, useMemo } from 'react'
import { clusterApiUrl, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TxVersion, validateAndParsePublicKey, txToBase64 } from '@raydium-io/raydium-sdk-v2'
import { useAppStore, defaultEndpoint } from '@/store/useAppStore'
import usePrevious from '@/hooks/usePrevious'
import shallow from 'zustand/shallow'
import { isLocal } from '@/utils/common'
import { getDevOnlyStorage } from '@/utils/localStorage'
import { SSRData } from '../../type'
import { toastSubject } from '../toast/useGlobalToast'
import { cancelAllRetry } from '@/utils/common'
import { sendWalletEvent } from '@/api/event'
import { validateTxData, extendTxData } from '@/api/txService'
import { parseUserAgent } from 'react-device-detect'
import { Buffer } from 'buffer' // if Buffer isn't already globally available

// 1) put this near the top of the file (if you haven't already)
type AnyTx = Transaction | VersionedTransaction;
// local, loose encoder that works regardless of which web3.js instance created the tx
const txToBase64Loose = (tx: any): string => {
  if (!tx || typeof tx.serialize !== 'function') throw new Error('Invalid transaction');
  // v0 VersionedTransaction usually carries a numeric .version; legacy may not
  const bytes =
    typeof tx.version === 'number'
      ? tx.serialize()
      : tx.serialize({ requireAllSignatures: false, verifySignatures: false });
  return Buffer.from(bytes).toString('base64');
};

const localFakePubKey = '_sherex_f_wallet_'
export const WALLET_STORAGE_KEY = 'walletName'

function useInitConnection(props: SSRData) {
  const { connection } = useConnection()
  const { publicKey: _publicKey, signAllTransactions: _signAllTransactions, signTransaction, wallet, connected } = useWallet()

  const publicKey = useMemo(() => {
    const localPub = getDevOnlyStorage(localFakePubKey)
    if (isLocal() && localPub) {
      try {
        return validateAndParsePublicKey({ publicKey: localPub })
      } catch {
        return _publicKey
      }
    }

    return _publicKey
  }, [_publicKey])

  const signAllTransactions = useMemo<
    ((propsTransactions: any[]) => Promise<any[]>) | undefined
   >(
     () =>
     _signAllTransactions
       ? async (propsTransactions: any[]) => {
            const isV0Tx = useAppStore.getState().txVersion === TxVersion.V0
            // let transactions = [...propsTransactions]
            // let unsignedTxData = (transactions as unknown[]).map(txToBase64Loose)
            let transactions: any[] = [...propsTransactions]
            let unsignedTxData = (transactions as unknown[]).map(txToBase64Loose)
            if (useAppStore.getState().wallet?.adapter.name?.toLowerCase() === 'walletconnect') {
              const { success, data: extendedTxData } = await extendTxData(unsignedTxData)
              if (success) {
                const allTxBuf = extendedTxData.map((tx) => Buffer.from(tx, 'base64'))
                transactions = allTxBuf.map((txBuf) =>
                  isV0Tx ? VersionedTransaction.deserialize(txBuf as unknown as Uint8Array) : Transaction.from(txBuf)
                )
                unsignedTxData = (transactions as unknown[]).map(txToBase64Loose)
              }
            }

            const deviceInfo = parseUserAgent(window.navigator.userAgent)
            const adapter = useAppStore.getState().wallet?.adapter
            const isAndroidCoinBase = deviceInfo.os.name === 'Android' && adapter?.name === 'Coinbase Wallet'

            const time = Date.now()
            


            // 3) inside your useMemo wrapper (replace the signing block)
            let allSignedTx: any[] = [];

            if (isAndroidCoinBase) {
              for (const tx of transactions) {
                // avoid the cross-package web3.js type mismatch
                const signed = await signTransaction!(tx as any);
                allSignedTx.push(signed as any);
              }
            } else {
              if (isV0Tx) {
                // v0: VersionedTransaction[]
                const signAllV0 = _signAllTransactions as unknown as (
                  txs: VersionedTransaction[]
                ) => Promise<VersionedTransaction[]>;
                allSignedTx = await signAllV0(transactions as unknown as VersionedTransaction[])
              } else {
                // legacy: Transaction[]
                const signAllLegacy = _signAllTransactions as unknown as (
                  txs: Transaction[]
                ) => Promise<Transaction[]>;
                allSignedTx = await signAllLegacy(transactions as unknown as Transaction[])
              }
            }

            // base64 encode using the loose encoder
            const allBase64Tx = (allSignedTx as unknown[]).map(txToBase64Loose)
            const res = await validateTxData({
              preData: unsignedTxData,
              data: allBase64Tx,
              userSignTime: Date.now() - time
            })
            if (!res.success) throw new Error(res.msg)

            return allSignedTx
          }
        : undefined,
    [_signAllTransactions]
  )

  const { urlConfigs, fetchRpcsAct, initRaydiumAct, raydium } = useAppStore(
    (s) => ({
      urlConfigs: s.urlConfigs,
      fetchRpcsAct: s.fetchRpcsAct,
      initRaydiumAct: s.initRaydiumAct,
      raydium: s.raydium
    }),
    shallow
  )
  const walletRef = useRef(wallet)
  const useWalletRef = useRef<{
    publicKey?: PublicKey | null
  }>({})
  const prevRpcEndPoint = usePrevious(connection.rpcEndpoint)
  const preUrlConfigs = usePrevious(urlConfigs)

  const isRpcChanged = !!prevRpcEndPoint && prevRpcEndPoint !== connection.rpcEndpoint
  const isUrlConfigChanged = urlConfigs !== preUrlConfigs
  const isNeedReload = isRpcChanged || isUrlConfigChanged

  useWalletRef.current = { publicKey }

  const showConnect = useCallback(
    (key: PublicKey) => {
      toastSubject.next({
        title: `${wallet?.adapter.name} wallet connected`,
        description: `Wallet ${key}`,
        status: 'success'
      })
    },
    [wallet]
  )

  const showDisconnect = useCallback(() => {
    toastSubject.next({
      title: `${wallet?.adapter.name} wallet disconnected`,
      status: 'warning'
    })
  }, [wallet])

  // fetch rpc nodes
  useEffect(() => {
    if (!useAppStore.getState().rpcs?.length) {
      fetchRpcsAct()
    }
  }, [fetchRpcsAct, urlConfigs.BASE_HOST])

  // register wallet connect/disconnect toast
  useEffect(() => {
    wallet?.adapter.once('connect', showConnect)
    wallet?.adapter.once('disconnect', showDisconnect)
    walletRef.current = wallet || walletRef.current

    return () => {
      wallet?.adapter.off('connect', showConnect)
      wallet?.adapter.off('disconnect', showDisconnect)
    }
  }, [wallet, showConnect, showDisconnect])

  // init raydium sdk or update connection action
  useEffect(() => {
    if (!connection || connection.rpcEndpoint === defaultEndpoint) return

    useAppStore.setState({ connection: connection as any, signAllTransactions }, false, { type: 'useInitConnection' } as any)
    // raydium sdk initialization can be done with connection only, if url or rpc changed, re-init
    if (raydium && !isNeedReload) {
      raydium.setConnection(connection)
      raydium.cluster = connection.rpcEndpoint === clusterApiUrl('devnet') ? 'devnet' : 'mainnet'
      return
    }

    const ssrReloadData = isNeedReload ? {} : props

    initRaydiumAct({ connection, ...ssrReloadData })
    // eslint-disable-next-line
  }, [initRaydiumAct, connection?.rpcEndpoint, raydium, signAllTransactions, isNeedReload])

  // update publickey/signAllTransactions in raydium sdk
  useEffect(() => {
    // if user connected wallet, update pubk
    if (raydium) {
      raydium.setOwner(publicKey || undefined)
      // bridge to Raydium’s expected type (avoids duplicate-web3 mismatch)
      const sdkSignAll = signAllTransactions
      ? ((txs: any[]) => signAllTransactions(txs)) // same runtime fn, just a typed adapter
      : undefined
      raydium.setSignAllTransactions(sdkSignAll as any)
    }
  }, [raydium, publicKey, signAllTransactions])

  // update publickey/wallet in app store
  useEffect(() => {
    const payload = {
      connected: !!useWalletRef.current.publicKey,
      publicKey: useWalletRef.current.publicKey || undefined,
      wallet: walletRef.current || undefined
    }
    useAppStore.setState(payload, false, { type: 'useInitConnection', payload } as any)
  }, [publicKey?.toBase58(), wallet?.adapter.name])

  useEffect(() => cancelAllRetry, [connection.rpcEndpoint])
  useEffect(() => {
    if (!wallet) return
    return () => useAppStore.setState({ txVersion: TxVersion.V0 })
  }, [wallet?.adapter.name])

  useEffect(() => {
    if (connected && publicKey) {
      sendWalletEvent({
        type: 'connectWallet',
        connectStatus: 'success',
        walletName: wallet?.adapter.name || 'unknown'
      })
      if (wallet) localStorage.setItem(WALLET_STORAGE_KEY, `"${wallet?.adapter.name}"`)
    }
  }, [publicKey, connected, wallet?.adapter.name])
}

export default useInitConnection
