import { Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import { Trans } from 'react-i18next';

const LAUCHPAD_TX_MSG = {
  launchBuy: {
    title: 'Launch and Buy Token',
    desc: 'Buy <sub>{{amountA}}</sub> <sub>{{symbolA}}</sub> with {{amountB}} <sub>{{symbolB}}</sub>',
    txHistoryTitle: 'Launch and Buy Token',
    txHistoryDesc: 'Buy <sub>{{amountA}}</sub> <sub>{{symbolA}}</sub> with {{amountB}} <sub>{{symbolB}}</sub>',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  buy: {
    title: 'Buy Token',
    desc: 'Buy <sub>{{amountA}}</sub> <sub>{{symbolA}}</sub> with {{amountB}} <sub>{{symbolB}}</sub>',
    txHistoryTitle: 'Buy Token',
    txHistoryDesc: 'Buy <sub>{{amountA}}</sub> <sub>{{symbolA}}</sub> with {{amountB}} <sub>{{symbolB}}</sub>',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  sell: {
    title: 'Sell Token',
    desc: 'Sell <sub>{{amountA}}</sub> <sub>{{symbolA}}</sub> to {{amountB}} <sub>{{symbolB}}</sub>',
    txHistoryTitle: 'Sell Token',
    txHistoryDesc: 'Sell <sub>{{amountA}}</sub> <sub>{{symbolA}}</sub> to {{amountB}} <sub>{{symbolB}}</sub>',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  }
}

export const getTxMeta = ({ action, values }: { action: keyof typeof LAUCHPAD_TX_MSG; values: Record<string, unknown> }) => {
  const meta = LAUCHPAD_TX_MSG[action]
  return {
    title: meta.title,
    description: <Trans i18nKey={meta.desc} values={values} components={meta.components} />,
    txHistoryTitle: meta.txHistoryTitle || meta.title,
    txHistoryDesc: meta.txHistoryDesc || meta.desc,
    txValues: values
  }
}
