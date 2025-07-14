import { Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import i18n from '@/i18n'
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
    title: i18n.t(meta.title, values),
    description: <Trans i18nKey={meta.desc} values={values} components={meta.components} />,
    txHistoryTitle: meta.txHistoryTitle || meta.title,
    txHistoryDesc: i18n.t(meta.txHistoryDesc, values) || i18n.t(meta.desc, values),
    txValues: values
  }
}
