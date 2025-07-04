import { Switch } from '@chakra-ui/react'
import { TxVersion } from '@raydium-io/raydium-sdk-v2'
import { useAppStore } from '@/store/useAppStore'
import { SettingField } from './SettingField'

export function VersionedTransactionSettingField() {
  const txVersion = useAppStore((s) => s.txVersion)
  const handleChange = () => {
    useAppStore.setState(
      {
        txVersion: txVersion === TxVersion.LEGACY ? TxVersion.V0 : TxVersion.LEGACY
      },
      false,
      { type: 'VersionedTransactionSettingField' } as any
    )
  }
  return (
    <SettingField
      fieldName="Versioned Transaction"
      tooltip="Versioned Tx is a significant upgrade that allows for additional functionality, including advanced swap routing. Before turning on Vers. Tx, ensure that your wallet is compatible."
      renderToggleButton={<Switch isChecked={txVersion === TxVersion.V0} onChange={handleChange} />}
    />
  )
}
