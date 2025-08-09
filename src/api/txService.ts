// src/api/txService.ts
import axios from './axios'
import { useAppStore } from '@/store/useAppStore'
import { parseUserAgent } from 'react-device-detect'

interface CheckTxResponse {
  id: string
  success: boolean
  msg?: string
}

// export const validateTxData = async (props: { data: string[]; preData: string[]; userSignTime: number }): Promise<CheckTxResponse> => {
//   try {
//     const { rpcs, rpcNodeUrl } = useAppStore.getState()
//     const deviceInfo = parseUserAgent(window.navigator.userAgent)
//     const deviceType = deviceInfo.device.type || 'pc'
//     const adapter = useAppStore.getState().wallet?.adapter

//     // 👉 call our proxy instead of service-v1.raydium.io/check-tx
//     const data: CheckTxResponse = await axios.post(
//       `/api/raydium/check-tx`,
//       {
//         walletName: adapter?.name || 'unknown',
//         metaData: adapter?.name === 'WalletConnect' ? (adapter as any)?._wallet._session?.peer?.metadata?.name : undefined,
//         deviceType,
//         rpc: rpcs.find((r) => r.url === rpcNodeUrl)?.name || 'userChange',
//         ...props
//       },
//       { skipError: true }
//     )
//     return data
//   } catch (err: any) {
//     return {
//       id: '',
//       success: false,
//       msg: err?.message || 'validate tx failed'
//     }
//   }
// }

interface TxExtendResponse {
  id: string
  success: boolean
  data: string[]
  msg?: string
}

// export const extendTxData = async (txData: string[]): Promise<TxExtendResponse> => {
//   try {
//     // 👉 call our proxy instead of service-v1.raydium.io/ins-extend
//     const data: TxExtendResponse = await axios.post(
//       `/api/raydium/ins-extend`,
//       {
//         walletName: useAppStore.getState().wallet?.adapter.name || 'unknown',
//         data: txData
//       },
//       { skipError: true }
//     )
//     return data
//   } catch (err: any) {
//     return {
//       id: '',
//       data: [],
//       success: false,
//       msg: err?.message || 'extend tx failed'
//     }
//   }
// }

// src/api/txService.ts (quick bypass version)
export const validateTxData = async (props: { data: string[]; preData: string[]; userSignTime: number }): Promise<CheckTxResponse> => {
  return { id: '', success: true }
}

export const extendTxData = async (txData: string[]): Promise<TxExtendResponse> => {
  return { id: '', success: true, data: [] }
}

