import { useLaunchpadStore } from '@/store'
import useSWR from 'swr'
import axios from '@/api/axios'
import { MintInfo, SherexMintInfo } from '@/views/Launchpad/type'
import ToPublicKey from '@/utils/publicKey'

export const mintInfoFetcher = (
  url: string
): Promise<{
  id: string
  success: boolean
  msg?: string
  data: {
    rows: SherexMintInfo[]
  }
}> => axios.get(url, { skipError: true })

export default function useSherexMintInfo({
  mints = [],
  refreshInterval = 30 * 1000
}: {
  mints: (string | undefined)[]
  refreshInterval?: number
}) {
  const backendHost = useLaunchpadStore((s) => s.backendHost)
  const mintQuery = mints
    .filter((m) => {
      if (!m) return false
      try {
        return ToPublicKey(m)
      } catch {
        return false
      }
    })
    .join(',')

  const { data, ...rest } = useSWR(mintQuery ? `${backendHost}/get/mints?ids=${mintQuery}` : null, mintInfoFetcher, {
    refreshInterval,
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    keepPreviousData: true
  })

  const isEmptyResult = !!mintQuery && !rest.isLoading && !(data?.data.rows.length && !rest.error)

  return {
    data: data?.data.rows || [],
    isEmptyResult,
    ...rest
  }
}
