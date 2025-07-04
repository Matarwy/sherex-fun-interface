import { useEffect } from 'react'
import { useAppStore, EXPLORER_KEY, APR_MODE_KEY, USER_ADDED_KEY, FEE_KEY, LAUNCHPAD_SLIPPAGE_KEY } from '@/store'
import { getStorageItem } from '@/utils/localStorage'

export default function useLoadStorageData() {
  useEffect(() => {
    const [explorerUrl, aprMode, userAdded, transactionFee, cacheLang] = [
      getStorageItem(EXPLORER_KEY),
      getStorageItem(APR_MODE_KEY),
      getStorageItem(USER_ADDED_KEY),
      getStorageItem(FEE_KEY),
      getStorageItem(LAUNCHPAD_SLIPPAGE_KEY)
    ]

    useAppStore.setState({
      ...(explorerUrl ? { explorerUrl } : {}),
      ...(aprMode ? { aprMode: aprMode as 'M' | 'D' } : {}),
      ...(transactionFee ? { transactionFee } : {}),
      ...(userAdded
        ? {
            displayTokenSettings: {
              ...useAppStore.getState().displayTokenSettings,
              userAdded: userAdded === 'true'
            }
          }
        : {})
    })
  }, [])
}
