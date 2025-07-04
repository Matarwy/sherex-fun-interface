import { Grid, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import NotFoundIcon from '@/icons/misc/NotFound'

export default function NotFound() {
  return (
    <Grid gridAutoFlow="row" gridTemplateColumns="minmax(0, 1fr)" height="100%" justifyItems="center" alignContent="center" gap={8}>
      <NotFoundIcon width={60} height={60} />
      <Text fontSize="sm" color={colors.lightPurple}>
        No results found.
      </Text>
    </Grid>
  )
}
