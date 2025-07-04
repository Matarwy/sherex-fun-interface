import DiscardMediaIcon from '@/icons/media/DiscardMediaIcon'
import TelegrameMediaIcon from '@/icons/media/TelegrameMediaIcon'
import TwitterMediaIcon from '@/icons/media/TwitterMediaIcon'
import ExternalLink from '@/icons/misc/ExternalLink'
import DocThumbnailIcon from '@/icons/pageNavigation/DocThumbnailIcon'
import { colors } from '@/theme/cssVariables'
import { Box, Flex, HStack, MenuDivider, MenuItem, MenuList, Text, Link } from '@chakra-ui/react'
import NextLink from 'next/link'

export function NavMoreButtonMenuPanel() {
  return (
    <MenuList>
      <Box py={3}>
        {/* <MenuItem>
          <Link as={NextLink} _hover={{ textDecoration: 'none' }} w="full" href="/portfolio">
            <HStack>
              <PortfolioPageThumbnailIcon color={colors.textLink} />
              <Text>{t('portfolio.title')}</Text>
            </HStack>
          </Link>
        </MenuItem> */}
        {/* <MenuItem>
          <Link as={NextLink} _hover={{ textDecoration: 'none' }} w="full" href="/staking">
            <HStack>
              <StakingPageThumbnailIcon />
              <Text>{t('staking.title')}</Text>
            </HStack>
          </Link>
        </MenuItem>
        <MenuItem>
          <Link as={NextLink} _hover={{ textDecoration: 'none' }} w="full" href="/bridge">
            <HStack>
              <BridgePageThumbnailIcon />
              <Text>{t('bridge.title')}</Text>
            </HStack>
          </Link>
        </MenuItem>
        <MenuDivider />
        <MenuItem>
          <Link as={NextLink} href="/docs/disclaimer" _hover={{ textDecoration: 'none' }} w="full" isExternal>
            <HStack>
              <DisclaimerThumbnailIcon />
              <Text>{t('disclaimer.title')}</Text>
              <ExternalLink color={colors.textSecondary} />
            </HStack>
          </Link>
        </MenuItem> */}
        <MenuItem>
          <Link as={NextLink} href="https://docs.sherex.fun/" _hover={{ textDecoration: 'none' }} w="full" isExternal>
            <HStack>
              <DocThumbnailIcon />
              <Text>Docs</Text>
              <ExternalLink color={colors.textSecondary} />
            </HStack>
          </Link>
        </MenuItem>
      </Box>
      <Flex mb={-1} mt={1} py={2} justifyContent={'space-around'} color={colors.textSecondary} bg={colors.backgroundTransparent07}>
        <Link as={NextLink} href="https://twitter.com/" isExternal>
          <TwitterMediaIcon />
        </Link>
        <Link as={NextLink} href="https://t.me/" isExternal>
          <TelegrameMediaIcon />
        </Link>
        <Link as={NextLink} href="https://discord.com/" isExternal>
          <DiscardMediaIcon />
        </Link>
      </Flex>
    </MenuList>
  )
}
