import { Connection, Keypair, PublicKey, SignatureResult, Transaction, VersionedTransaction } from '@solana/web3.js'
import createStore from './createStore'
import { useAppStore } from './useAppStore'
import ToPublicKey from '@/utils/publicKey'
import { getComputeBudgetConfig } from '@/utils/tx/computeBudget'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import { TOAST_DURATION, txStatusSubject } from '@/hooks/toast/useTxStatus'
import { TxCallbackProps } from '@/types/tx'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { getTxMeta } from './configs/lauchpad'
import { encodeStr } from '@/utils/common'
import {
  getPdaLaunchpadAuth,
  LaunchpadPoolInfo,
  txToBase64,
  TxVersion,
  LaunchpadPoolInitParam,
  LaunchpadConfig,
  FEE_RATE_DENOMINATOR,
  ApiV3Token,
  DEV_LAUNCHPAD_PROGRAM,
  Raydium,
  printSimulate,
  LAUNCHPAD_PROGRAM
} from '@raydium-io/raydium-sdk-v2'
import axios from '@/api/axios'
import { ConfigInfo, MintInfo } from '@/views/Launchpad/type'
import { refreshChartSubject } from '@/components/TradingView/TVChart'
import { LaunchpadConfigInfo } from '@/hooks/launchpad/usePoolRpcInfo'
import { useTokenAccountStore } from './useTokenAccountStore'
import { getDefaultToastData, handleMultiTxToast } from '@/hooks/toast/multiToastUtil'
import { handleMultiTxRetry } from '@/hooks/toast/retryTx'
import { wSolToSolString } from '@/utils/token'

export const LAUNCHPAD_SLIPPAGE_KEY = '_sherex_lau_slp_'


export interface CreateMintAdvanceConfig {
  supply?: BN
  totalSellA?: BN
  totalFundRaisingB?: BN
  totalLockedAmount?: BN
  cliffPeriod?: BN
  unlockPeriod?: BN
  migrateType?: 'amm' | 'cpmm'
}
export interface LaunchpadState {
  token?: string
  authHost: string
  commentHost: string
  historyHost: string
  mintHost: string
  slippage: number
  platformId: string

  refreshPoolMint?: string
  configInfo: Map<string, LaunchpadConfigInfo>

  createRandomMintAct: (
    data: {
      decimals?: number
      file: File
      name: string
      symbol: string
      website?: string
      twitter?: string
      telegram?: string
      description?: string
      configId: string
    } & CreateMintAdvanceConfig
  ) => Promise<{ mint: string; metadataLink: string } | undefined>

  createMintAct: (
    data: {
      file?: File
      name: string
      symbol: string
      decimals?: number
      description?: string
      cfToken: string
      website?: string
      twitter?: string
      telegram?: string
      configId: string
    } & CreateMintAdvanceConfig
  ) => Promise<string | undefined>

  createAndBuyAct: (
    data: {
      programId?: PublicKey
      mint: string

      name: string
      uri: string
      symbol: string
      decimals?: number
      buyAmount: BN
      minMintAAmount?: BN
      slippage?: BN
      migrateType?: 'amm' | 'cpmm'
      notExecute?: boolean
      shareFeeReceiver?: PublicKey
      configInfo: LaunchpadConfigInfo
      configId: string | PublicKey
      platformFeeRate?: BN
      mintKp: Keypair

      mintBInfo: ApiV3Token

      supply?: BN
      totalSellA?: BN
      totalFundRaisingB?: BN
      totalLockedAmount?: BN
      cliffPeriod?: BN
      unlockPeriod?: BN

      curveType?: number
    } & TxCallbackProps
  ) => Promise<{ txId: string; poolInfo?: LaunchpadPoolInfo }>

  buyAct: (
    data: {
      programId?: PublicKey
      mintInfo: MintInfo
      buyAmount: BN
      slippage?: BN
      mintB?: PublicKey
      minMintAAmount?: BN
      symbolB?: string
      mintBDecimals?: number
      shareFeeReceiver?: PublicKey
      configInfo?: LaunchpadConfigInfo
      platformFeeRate?: BN
    } & TxCallbackProps
  ) => Promise<string>

  sellAct: (
    data: {
      programId?: PublicKey
      mintInfo: MintInfo
      sellAmount: BN
      minAmountB?: BN
      slippage?: BN
      mintB?: PublicKey
      symbolB?: string
      mintBDecimals?: number
      shareFeeReceiver?: PublicKey
      configInfo?: LaunchpadConfigInfo
      platformFeeRate?: BN
    } & TxCallbackProps
  ) => Promise<string>

  getConfigInfo: (configId: string | PublicKey) => Promise<LaunchpadConfigInfo | undefined>
}

export const defaultShareFeeRate = new BN(10000)
export const launchpadShareRate = new Decimal(defaultShareFeeRate.toString())
  .div(FEE_RATE_DENOMINATOR.toString())
  .mul(100)
  .toDecimalPlaces(2)
  .toString()

const initialState = {
  authHost: process.env.NEXT_PUBLIC_LAUNCH_AUTH_HOST || 'https://launch-auth-v1.raydium.io',
  commentHost: process.env.NEXT_PUBLIC_LAUNCH_COMMENT_HOST || 'https://launch-forum-v1.raydium.io',
  historyHost: process.env.NEXT_PUBLIC_LAUNCH_HISTORY_HOST || 'https://launch-history-v1.raydium.io',
  mintHost: process.env.NEXT_PUBLIC_LAUNCH_MINT_HOST || 'https://launch-mint-v1.raydium.io',
  // platformId: process.env.NEXT_PUBLIC_PLATFORM_ID || 'FwKALh5mEfqWVPU24e5VXavydtnwb1veUi4Z3ShiYb8g',
  platformId: process.env.NEXT_PUBLIC_PLATFORM_ID || 'FwKALh5mEfqWVPU24e5VXavydtnwb1veUi4Z3ShiYb8g',
  slippage: 0.025,
  configInfo: new Map()
}

export const useLaunchpadStore = createStore<LaunchpadState>((set, get) => ({
  ...initialState,

  createRandomMintAct: async (props) => {
    const token = get().token
    const { publicKey } = useAppStore.getState()
    if (!publicKey || !token) return

    if (props.name.length > 32) {
      toastSubject.next({
        status: 'error',
        title: 'Token name error',
        description: 'can not exceed length 32'
      })
      return
    }

    if (props.symbol.length > 10) {
      toastSubject.next({
        status: 'error',
        title: 'Token symbol error',
        description: 'can not exceed length 10'
      })
      return
    }

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('name', props.name)
    formData.append('ticker', props.symbol) // Changed from 'symbol' to 'ticker'
    formData.append('description', props.description || '')
    formData.append('wallet', publicKey.toBase58())
    formData.append('decimals', (props.decimals ?? LaunchpadPoolInitParam.decimals).toString())
    formData.append('supply', (props.supply ?? LaunchpadPoolInitParam.supply).toString())
    formData.append('totalSellA', props.totalSellA ? props.totalSellA.toString() : LaunchpadPoolInitParam.totalSellA.toString())
    formData.append('totalFundRaisingB', props.totalFundRaisingB ? props.totalFundRaisingB.toString() : LaunchpadPoolInitParam.totalFundRaisingB.toString())
    formData.append('totalLockedAmount', props.totalLockedAmount ? props.totalLockedAmount.toString() : LaunchpadPoolInitParam.totalLockedAmount.toString())
    formData.append('cliffPeriod', props.cliffPeriod ? props.cliffPeriod.toString() : LaunchpadPoolInitParam.cliffPeriod.toString())
    formData.append('unlockPeriod', props.unlockPeriod ? props.unlockPeriod.toString() : LaunchpadPoolInitParam.unlockPeriod.toString())
    formData.append('platformId', get().platformId)
    formData.append('migrateType', props.migrateType || 'amm')
    formData.append('configId', props.configId)

    // Add optional social links
    if (props.website) formData.append('website', props.website)
    if (props.twitter) formData.append('twitter', props.twitter)
    if (props.telegram) formData.append('telegram', props.telegram)

    // Add file if present
    if (props.file) {
      formData.append('file', props.file)
    }

    const r: {
      id: string
      success: boolean
      data: { mint: string; metadataLink: string }
    } = await axios.postForm(
      `${get().mintHost}/create/get-random-mint`,
      formData,
      {
        headers: {
          'ray-token': token
        },
        skipError: true,
        authTokenCheck: true
      }
    )

    return r.data
  },

  createMintAct: async (props) => {
    const token = get().token
    const { publicKey } = useAppStore.getState()
    if (!publicKey || !token) return

    if (props.name.length > 32) {
      toastSubject.next({
        status: 'error',
        title: 'Token name error',
        description: 'can not exceed length 32'
      })
      return
    }

    if (props.symbol.length > 10) {
      toastSubject.next({
        status: 'error',
        title: 'Token symbol error',
        description: 'can not exceed length 10'
      })
      return
    }

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('name', props.name)
    formData.append('ticker', props.symbol) // Changed from 'symbol' to 'ticker'
    formData.append('description', props.description || '')
    formData.append('wallet', publicKey.toBase58())
    formData.append('decimals', (props.decimals ?? LaunchpadPoolInitParam.decimals).toString())
    formData.append('supply', (props.supply ?? LaunchpadPoolInitParam.supply).toString())
    formData.append('totalSellA', props.totalSellA ? props.totalSellA.toString() : LaunchpadPoolInitParam.totalSellA.toString())
    formData.append('totalFundRaisingB', props.totalFundRaisingB ? props.totalFundRaisingB.toString() : LaunchpadPoolInitParam.totalFundRaisingB.toString())
    formData.append('totalLockedAmount', props.totalLockedAmount ? props.totalLockedAmount.toString() : LaunchpadPoolInitParam.totalLockedAmount.toString())
    formData.append('cliffPeriod', props.cliffPeriod ? props.cliffPeriod.toString() : LaunchpadPoolInitParam.cliffPeriod.toString())
    formData.append('unlockPeriod', props.unlockPeriod ? props.unlockPeriod.toString() : LaunchpadPoolInitParam.unlockPeriod.toString())
    formData.append('platformId', get().platformId)
    formData.append('migrateType', props.migrateType || 'amm')
    formData.append('cfToken', props.cfToken)
    formData.append('configId', props.configId)

    // Add optional social links
    if (props.website) formData.append('website', props.website)
    if (props.twitter) formData.append('twitter', props.twitter)
    if (props.telegram) formData.append('telegram', props.telegram)

    // Add file if present
    if (props.file) {
      formData.append('file', props.file)
    }

    // Debug: Log the FormData contents
    console.log('FormData contents:')
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    try {
      const r: {
        id: string
        success: boolean
        data: {
          mint: string
        }
      } = await axios.postForm(
        `${get().mintHost}/create/mint-info`,
        formData,
        {
          headers: {
            'ray-token': token
          },
          skipError: false, // Changed to false to get error details
          authTokenCheck: true
        }
      )

      console.log('API Response:', r)
      return r.data.mint
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error.message)
      console.error('Full error:', error)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      throw error
    }
  },



  createAndBuyAct: async ({
    programId = useAppStore.getState().programIdConfig.LAUNCHPAD_PROGRAM,
    mint,
    name,
    symbol,
    uri,
    decimals = 6,
    mintBInfo,
    buyAmount,
    slippage,
    minMintAAmount,
    migrateType = 'amm',
    notExecute,
    shareFeeReceiver,
    configId,
    configInfo,
    platformFeeRate,
    mintKp,
    supply,
    totalSellA,
    totalFundRaisingB,
    totalLockedAmount,
    cliffPeriod,
    unlockPeriod,

    ...callback
  }) => {
    try {
      console.log("calling createAndBuyAct!!...")
      const { raydium, txVersion } = useAppStore.getState()
      if (!raydium) return { txId: '' }

      if (name.length > 32) {
        toastSubject.next({
          status: 'error',
          title: 'Token name error',
          description: 'can not exceed length 32'
        })
        return { txId: '' }
      }

      if (symbol.length > 10) {
        toastSubject.next({
          status: 'error',
          title: 'Token symbol error',
          description: 'can not exceed length 10'
        })
        return { txId: '' }
      }
      const mintHost = 'https://launch-mint-v1.raydium.io'


      // const pair = Keypair.generate()
      console.log('platformId', get().platformId)



      const configRes: {
        data: {

          data: {
            key: ConfigInfo
            mintInfoB: ApiV3Token
          }[]

        }
      } = await axios.get(`${mintHost}/main/configs`)
      console.log("configRes======>", configRes)

      const configs = configRes.data.data[0].key
      const configInfo: ReturnType<typeof LaunchpadConfig.decode> = {
        index: configs.index,
        mintB: new PublicKey(configs.mintB),
        tradeFeeRate: new BN(configs.tradeFeeRate),
        epoch: new BN(configs.epoch),
        curveType: configs.curveType,
        migrateFee: new BN(configs.migrateFee),
        maxShareFeeRate: new BN(configs.maxShareFeeRate),
        minSupplyA: new BN(configs.minSupplyA),
        maxLockRate: new BN(configs.maxLockRate),
        minSellRateA: new BN(configs.minSellRateA),
        minMigrateRateA: new BN(configs.minMigrateRateA),
        minFundRaisingB: new BN(configs.minFundRaisingB),
        protocolFeeOwner: new PublicKey(configs.protocolFeeOwner),
        migrateFeeOwner: new PublicKey(configs.migrateFeeOwner),
        migrateToAmmWallet: new PublicKey(configs.migrateToAmmWallet),
        migrateToCpmmWallet: new PublicKey(configs.migrateToCpmmWallet),
      }

      const configId = new PublicKey(configRes.data.data[0].key.pubKey)

      const mintBInfo = configRes?.data?.data[0]?.mintInfoB

      console.log("configInfo", configInfo)
      console.log("configId", configId)
      console.log("mintBInfo", mintBInfo)

      const newMintData = {
        wallet: raydium.ownerPubKey.toBase58(),
        configId: configId.toString(),
        decimals: LaunchpadPoolInitParam.decimals,
        supply: LaunchpadPoolInitParam.supply, // or custom set up supply
        totalSellA: LaunchpadPoolInitParam.totalSellA, // or custom set up totalSellA
        totalFundRaisingB: LaunchpadPoolInitParam.totalFundRaisingB,
        totalLockedAmount: LaunchpadPoolInitParam.totalLockedAmount,
        cliffPeriod: LaunchpadPoolInitParam.cliffPeriod,
        unlockPeriod: LaunchpadPoolInitParam.unlockPeriod,
        // set your platform id, current platform: bonk
        platformId: new PublicKey('FEkF8SrSckk5GkfbmtcCbuuifpTKkw6mrSNowwB8aQe3'),
        migrateType: 'amm', // or cpmm
        description: 'description',
      }
      const mintBDecimals = mintBInfo.decimals

      const { execute, transactions, extInfo } = await raydium.launchpad.createLaunchpad({
        programId: LAUNCHPAD_PROGRAM,
        mintA: mintKp.publicKey, // Use the actual mint keypair instead of generating a new one
        decimals: newMintData.decimals,
        name: name,
        symbol: symbol,
        uri,
        migrateType: 'amm',
        configId,
        configInfo,
        mintBDecimals,

        platformId: new PublicKey("FEkF8SrSckk5GkfbmtcCbuuifpTKkw6mrSNowwB8aQe3"),

        txVersion: TxVersion.V0,
        slippage: slippage || new BN(100), // Use the passed slippage or default to 1%
        buyAmount: buyAmount, // Use the actual buy amount passed to the function
        createOnly: false, // true means create mint only, false will "create and buy together"

        supply: newMintData.supply, // lauchpad mint supply amount, default: LaunchpadPoolInitParam.supply
        totalSellA: newMintData.totalSellA, // lauchpad mint sell amount, default: LaunchpadPoolInitParam.totalSellA
        totalFundRaisingB: newMintData.totalFundRaisingB, // if mintB = SOL, means 85 SOL, default: LaunchpadPoolInitParam.totalFundRaisingB
        totalLockedAmount: newMintData.totalLockedAmount, // total locked amount, default 0
        cliffPeriod: newMintData.cliffPeriod, // unit: seconds, default 0
        unlockPeriod: newMintData.unlockPeriod, // unit: seconds, default 0
        initV2: true,
        extraSigners: [mintKp] // Add the mint keypair as an extra signer
      })

      console.log("extInfo======>", extInfo)
      const amountA = extInfo.swapInfo.amountA.amount.toString()
      console.log("amountA======>", amountA)
      const amountB = extInfo.swapInfo.amountB.toString()
      console.log("amountB======>", amountB)

      const transaction = transactions[0]
      console.log("tx simulation  ", await raydium.connection.simulateTransaction(transaction))

      // Execute the transaction (this will handle signing and sending)
      try {
        console.log("Executing transaction...")
        // Get the connected wallet's keypair
        const { publicKey } = useAppStore.getState()
        if (!publicKey) {
          throw new Error("No connected wallet")
        }

        // Use the execute function which handles signing properly
        const { signedTxs } = await execute({ notSendToRpc: false, sequentially: true })
        console.log("signedTxs======>", signedTxs)

        // Send the signed transaction
        const signature = await raydium.connection.sendTransaction(signedTxs[0])
        console.log("signature", signature)

        const confirmation = await raydium.connection.confirmTransaction(signature)
        console.log("confirmation", confirmation);

        // Get the transaction ID from the signature
        const txId = signature

        // Update UI and callbacks
        txStatusSubject.next({
          txId,
          ...callback,
          signedTx: transaction,
          onConfirmed: () => {
            callback.onConfirmed?.()
            useTokenAccountStore.getState().fetchTokenAccountAct({})
            setTimeout(() => {
              set({ refreshPoolMint: mint })
              refreshChartSubject.next(mint)
            }, 1000)
          }
        })

        return { txId, poolInfo: extInfo.address }
      } catch (error: any) {
        console.error("Transaction failed:", error)
        callback.onError?.()
        toastSubject.next({ status: 'error', description: 'Transaction failed', txError: error })
        return { txId: '' }
      }

      // console.log('poolId: ', extInfo)
      // // console.log(sentInfo)


      // let meta = getTxMeta({
      //   action: 'buy',
      //   values: {
      //     amountA: new Decimal(amountA)
      //       .div(10 ** decimals)
      //       .toDecimalPlaces(decimals)
      //       .toString(),
      //     symbolA: symbol || encodeStr(mint, 5),
      //     amountB: new Decimal(buyAmount.toString())
      //       .div(10 ** mintBInfo.decimals)
      //       .toDecimalPlaces(mintBInfo.decimals)
      //       .toString(),
      //     symbolB: symbolB
      //   }
      // })

      // let txId = ''
      // const isV0Tx = txVersion === TxVersion.V0
      // try {
      //   // const txSignature = await connection
      //   console.log("calling execute...")
      //   const { signedTxs } = await execute({ notSendToRpc: false, sequentially: true })
      //   console.log("signedTxs======>", signedTxs)



      //   const { data } = await axios.post(
      //     `${get().mintHost}/create/sendTransaction`,
      //     { txs: [txToBase64(signedTxs[0])] },
      //     { skipError: true }
      //   )
      //   console.log("data======>", data)
      //   const txBuf = Buffer.from(data.tx, 'base64')
      //   const bothSignedTx = VersionedTransaction.deserialize(txBuf as any)

      //   if (signedTxs.length < 2) {
      //     if (isV0Tx) {
      //       txId = await raydium.connection.sendTransaction(bothSignedTx as VersionedTransaction, { skipPreflight: true })
      //     } else {
      //       txId = await raydium.connection.sendRawTransaction(bothSignedTx.serialize(), { skipPreflight: true })
      //     }
      //     txStatusSubject.next({
      //       txId,
      //       ...callback,
      //       ...meta,
      //       signedTx: signedTxs[0],
      //       onConfirmed: () => {
      //         callback.onConfirmed?.()
      //         useTokenAccountStore.getState().fetchTokenAccountAct({})
      //         setTimeout(() => {
      //           set({ refreshPoolMint: mint })
      //           refreshChartSubject.next(mint)
      //         }, 1000)
      //       }
      //     })
      //     return { txId, poolInfo: extInfo.address }
      //   }



      //   signedTxs[0] = bothSignedTx
      //   console.log('simulate tx string:', signedTxs.map(txToBase64))

      //   const txLength = signedTxs.length
      //   const { toastId, handler } = getDefaultToastData({
      //     txLength,
      //     ...callback,
      //     onConfirmed: () => {
      //       setTimeout(() => {
      //         callback.onConfirmed?.()
      //       }, 1500)

      //       useTokenAccountStore.getState().fetchTokenAccountAct({})
      //       setTimeout(() => {
      //         set({ refreshPoolMint: mint })
      //         refreshChartSubject.next(mint)
      //       }, 2000)
      //     }
      //   })

      //   meta = getTxMeta({
      //     action: 'launchBuy',
      //     values: {
      //       amountA: new Decimal(extInfo.swapInfo.decimalOutAmount.toString())
      //         .div(10 ** decimals)
      //         .toDecimalPlaces(decimals)
      //         .toString(),
      //       symbolA: symbol || encodeStr(mint, 5),
      //       amountB: new Decimal(buyAmount.toString())
      //         .div(10 ** mintBInfo.decimals)
      //         .toDecimalPlaces(mintBInfo.decimals)
      //         .toString(),
      //       symbolB: wSolToSolString(mintBInfo.symbol)
      //     }
      //   })

      //   const processedId: {
      //     txId: string
      //     status: 'success' | 'error' | 'sent'
      //     signedTx: Transaction | VersionedTransaction
      //   }[] = []

      //   const getSubTxTitle = (idx: number) => {
      //     return idx === 0 ? 'launchpad.create_token' : 'launchpad.buy_token_title'
      //   }

      //   let i = 0
      //   const checkSendTx = async (): Promise<void> => {
      //     if (!signedTxs[i]) return
      //     const tx = signedTxs[i]
      //     const txId = !isV0Tx
      //       ? await raydium.connection.sendRawTransaction(tx.serialize(), { skipPreflight: true, maxRetries: 0 })
      //       : await raydium.connection.sendTransaction(tx as VersionedTransaction, { skipPreflight: true, maxRetries: 0 })
      //     processedId.push({ txId, signedTx: tx, status: 'sent' })

      //     let timeout = 0
      //     let intervalId = 0
      //     let intervalCount = 0

      //     const cbk = (signatureResult: SignatureResult) => {
      //       window.clearTimeout(timeout)
      //       window.clearInterval(intervalId)
      //       const targetTxIdx = processedId.findIndex((tx) => tx.txId === txId)
      //       if (targetTxIdx > -1) processedId[targetTxIdx].status = signatureResult.err ? 'error' : 'success'
      //       handleMultiTxRetry(processedId)
      //       handleMultiTxToast({
      //         toastId,
      //         processedId: processedId.map((p) => ({ ...p, status: p.status === 'sent' ? 'info' : p.status })),
      //         txLength,
      //         meta,
      //         isSwap: true,
      //         handler,
      //         getSubTxTitle
      //       })
      //       if (!signatureResult.err) checkSendTx()
      //     }

      //     const subId = raydium.connection.onSignature(txId, cbk, 'processed')
      //     raydium.connection.getSignatureStatuses([txId])

      //     intervalId = window.setInterval(async () => {
      //       const targetTxIdx = processedId.findIndex((tx) => tx.txId === txId)
      //       if (intervalCount++ > TOAST_DURATION / 2000 || processedId[targetTxIdx].status !== 'sent') {
      //         window.clearInterval(intervalId)
      //         return
      //       }
      //       try {
      //         const r = await raydium.connection.getTransaction(txId, {
      //           commitment: 'confirmed',
      //           maxSupportedTransactionVersion: TxVersion.V0
      //         })
      //         if (r) {
      //           console.log('tx status from getTransaction:', txId)
      //           cbk({ err: r.meta?.err || null })
      //           window.clearInterval(intervalId)
      //           useTokenAccountStore.getState().fetchTokenAccountAct({ commitment: useAppStore.getState().commitment })
      //         }
      //       } catch (e) {
      //         console.error('getTransaction timeout:', e, txId)
      //         window.clearInterval(intervalId)
      //       }
      //     }, 2000)

      //     handleMultiTxRetry(processedId)
      //     handleMultiTxToast({
      //       toastId,
      //       processedId: processedId.map((p) => ({ ...p, status: p.status === 'sent' ? 'info' : p.status })),
      //       txLength,
      //       meta,
      //       isSwap: true,
      //       handler,
      //       getSubTxTitle
      //     })

      //     timeout = window.setTimeout(() => {
      //       raydium.connection.removeSignatureListener(subId)
      //     }, TOAST_DURATION)

      //     i++
      //   }
      //   checkSendTx()

      //   return { txId: '' }
      // } catch (e: any) {
      //   const errorMsg = e.response?.data?.msg
      //   callback.onError?.()
      //   toastSubject.next({ status: 'error', ...meta, description: errorMsg || undefined, txError: errorMsg ? undefined : e })
      // } finally {
      //   callback.onFinally?.()
      // }

      return { txId: '' }
    } catch (err) {
      console.log("er while creating and buying======>", err)
      return { txId: '' }
    }
  },
  buyAct: async ({
    programId = useAppStore.getState().programIdConfig.LAUNCHPAD_PROGRAM,
    mintInfo,
    buyAmount,
    minMintAAmount,
    slippage,
    mintB,
    symbolB,
    mintBDecimals = 9,
    shareFeeReceiver,
    configInfo,
    platformFeeRate,
    onSent,
    onConfirmed,
    onError,
    onFinally
  }) => {
    const { raydium, txVersion } = useAppStore.getState()
    if (!raydium) return ''

    const { execute, extInfo } = await raydium.launchpad.buyToken({
      programId,
      mintA: ToPublicKey(mintInfo.mint),
      txVersion,
      buyAmount,
      slippage,
      mintB,
      minMintAAmount, // use sdk to get realtime rpc data
      shareFeeReceiver,
      shareFeeRate: shareFeeReceiver ? defaultShareFeeRate : undefined,
      configInfo,
      platformFeeRate,
      computeBudgetConfig: raydium.cluster === 'devnet' ? undefined : await getComputeBudgetConfig()
    })

    const meta = getTxMeta({
      action: 'buy',
      values: {
        amountA: new Decimal((minMintAAmount ?? extInfo.decimalOutAmount).toString())
          .div(10 ** Number(mintInfo.decimals))
          .toDecimalPlaces(Number(mintInfo.decimals))
          .toString(),
        symbolA: mintInfo.symbol ?? encodeStr(mintInfo.mint, 5),
        amountB: new Decimal(buyAmount.toString())
          .div(10 ** mintBDecimals)
          .toDecimalPlaces(mintBDecimals)
          .toString(),
        symbolB: symbolB ?? 'SOL'
      }
    })


    const executeWithRetry = async (retryCount = 0): Promise<string> => {
      try {
        const result = await execute()
        const { txId, signedTx } = result
        txStatusSubject.next({
          txId,
          ...meta,
          signedTx,
          onSent,
          onError,
          onConfirmed: () => {
            onConfirmed?.()
            useTokenAccountStore.getState().fetchTokenAccountAct({})
          }
        })
        return txId
      } catch (e: any) {
        console.error("Buy token error:", e)

        // Check if this is the specific error about keypair or expired mint
        const errorMessage = e.message || e.toString()
        const isKeypairError = errorMessage.includes('can not sign keypair') ||
          errorMessage.includes('temporary mint has expired') ||
          errorMessage.includes('please regenerate')

        // Retry once if it's a keypair/expired mint error
        if (isKeypairError && retryCount === 0) {
          console.log("Retrying buy token transaction due to keypair/expired mint error...")
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000))
          return executeWithRetry(retryCount + 1)
        }

        onError?.()
        toastSubject.next({ ...meta, txError: e })
        return ''
      }
    }

    return executeWithRetry()
      .finally(onFinally)
  },

  sellAct: async ({
    programId = useAppStore.getState().programIdConfig.LAUNCHPAD_PROGRAM,
    mintInfo,
    sellAmount,
    minAmountB,
    slippage,
    mintB,
    symbolB,
    mintBDecimals = 9,
    shareFeeReceiver,
    configInfo,
    platformFeeRate,
    onSent,
    onConfirmed,
    onError,
    onFinally
  }) => {
    const { raydium, txVersion } = useAppStore.getState()
    if (!raydium) return ''

    const { execute, extInfo } = await raydium.launchpad.sellToken({
      programId,
      authProgramId: getPdaLaunchpadAuth(programId).publicKey,
      mintA: ToPublicKey(mintInfo.mint),
      txVersion,
      sellAmount,
      slippage,
      mintB,
      minAmountB,
      configInfo,
      platformFeeRate,
      shareFeeReceiver,
      shareFeeRate: shareFeeReceiver ? defaultShareFeeRate : undefined,
      computeBudgetConfig: raydium.cluster === 'devnet' ? undefined : await getComputeBudgetConfig()
    })
    const decimals = Number(mintInfo.decimals)
    const meta = getTxMeta({
      action: 'sell',
      values: {
        amountA: new Decimal(sellAmount.toString())
          .div(10 ** decimals)
          .toDecimalPlaces(decimals)
          .toString(),
        symbolA: mintInfo.symbol ?? encodeStr(mintInfo.mint, 5),
        amountB: new Decimal((minAmountB ?? extInfo.outAmount).toString())
          .div(10 ** mintBDecimals)
          .toDecimalPlaces(mintBDecimals)
          .toString(),
        symbolB: symbolB ?? 'SOL'
      }
    })

    return execute()
      .then(({ txId, signedTx }) => {
        txStatusSubject.next({
          txId,
          ...meta,
          signedTx,
          onSent,
          onError,
          onConfirmed: () => {
            onConfirmed?.()
            useTokenAccountStore.getState().fetchTokenAccountAct({})
          }
        })
        return txId
      })
      .catch((e) => {
        onError?.()
        toastSubject.next({ ...meta, txError: e })
        return ''
      })
      .finally(onFinally)
  },
  getConfigInfo: async (configId) => {
    const { connection } = useAppStore.getState()
    const config = get().configInfo.get(configId.toString())
    if (config) return config
    if (!connection) return
    const r = await connection.getAccountInfo(ToPublicKey(configId))
    if (!r) return
    const allConfig = new Map(Array.from(get().configInfo))
    const configData = LaunchpadConfig.decode(r.data)
    allConfig.set(configId.toString(), configData)
    set({
      configInfo: allConfig
    })
    return configData
  }
}))
