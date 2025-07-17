import { Trans } from 'react-i18next'
import { Text } from '@chakra-ui/react'
import i18n from '@/i18n'
import { colors } from '@/theme/cssVariables/colors'

const SWAP_TX_MSG = {
  swap: {
    title: 'Swap',
    desc: 'Swap <sub>{{amountA}} {{symbolA}}</sub> for <sub>{{amountB}} {{symbolB}}</sub>.',
    txHistoryTitle: 'Swap',
    txHistoryDesc: 'Swap <sub>{{amountA}} {{symbolA}}</sub> for <sub>{{amountB}} {{symbolB}}</sub>.',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  }
}
export const getTxMeta = ({ action, values = {} }: { action: keyof typeof SWAP_TX_MSG; values?: Record<string, unknown> }) => {
  const meta = SWAP_TX_MSG[action]
  return {
    title: i18n.t(meta.title, values),
    description: <Trans i18nKey={meta.desc} values={values} components={meta.components} />,
    txHistoryTitle: meta.txHistoryTitle || meta.title,
    txHistoryDesc: i18n.t(meta.txHistoryDesc, values) || i18n.t(meta.desc, values),
    txValues: values
  }
}
