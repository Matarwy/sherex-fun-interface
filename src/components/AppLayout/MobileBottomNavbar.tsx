import { Box, ColorMode, Menu, MenuButton, SimpleGrid, Text, VStack, useColorMode } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'

import LiquidityPageThumbnailIcon from '@/icons/pageNavigation/LiquidityPageThumbnailIcon'
import MorePageThumbnailIcon from '@/icons/pageNavigation/MoreThumbnailIcon'
import PortfolioPageThumbnailIcon from '@/icons/pageNavigation/PortfolioPageThumbnailIcon'
import PerpetualsPageThumbnailIcon from '@/icons/pageNavigation/PerpetualsPageThumbnailIcon'
import SwapPageThumbnailIcon from '@/icons/pageNavigation/SwapPageThumbnailIcon'
import LaunchpadPageThumbnailIcon from '@/icons/pageNavigation/LaunchpadPageThumbnailIcon'
import { colors } from '@/theme/cssVariables'
import { NavMoreButtonMenuPanel } from './components/NavMoreButtonMenuPanel'
import { shrinkToValue } from '@/utils/shrinkToValue'

/** only used is Mobile */
export function MobileBottomNavbar() {
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const { pathname } = useRouter()

  const boardHref = '/'
  const isBoardActive = pathname === boardHref
  const swapHref = '/swap'
  const isSwapActive = pathname === swapHref
  const createHref = '/create'
  const isCreateActive = pathname === createHref
  const profileHref = '/profile'
  const isProfileActive = pathname === profileHref

  return (
    <SimpleGrid
      gridAutoFlow={'column'}
      gridAutoColumns={'1fr'}
      placeItems={'center'}
      height={'54px'}
      py={2}
      bg={colors.backgroundLight}
      borderTop={isLight ? `1px solid rgba(171, 196, 255, 0.2)` : `1px solid transparent`}
    >
      {/* <BottomNavbarItem
        href={swapHref}
        text={t('swap.title')}
        icon={(colorMode) => <SwapPageThumbnailIcon colorMode={colorMode} isActive={isSwapActive} />}
        isActive={isSwapActive}
      />
      <BottomNavbarItem
        href={liquidityHref}
        text={t('liquidity.title')}
        icon={(colorMode) => <LiquidityPageThumbnailIcon colorMode={colorMode} isActive={isLiquidityActive} />}
        isActive={isLiquidityActive}
      />
      <BottomNavbarItem
        href={protfolioHref}
        text={t('portfolio.title')}
        icon={(colorMode) => <PortfolioPageThumbnailIcon colorMode={colorMode} isActive={isPortfolioActive} />}
        isActive={isPortfolioActive}
      />
      <BottomNavbarItem
        href="https://perps.raydium.io"
        text={t('perpetuals.title')}
        icon={(colorMode) => <PerpetualsPageThumbnailIcon colorMode={colorMode} isActive={false} />}
        isActive={false}
      /> */}
      <BottomNavbarItem
        href={boardHref}
        text="Board"
        icon={(colorMode) => <LiquidityPageThumbnailIcon w="240px" colorMode={colorMode} isActive={isBoardActive} />}
        isActive={isBoardActive}
      />
      <BottomNavbarItem
        href={swapHref}
        text="Swap"
        icon={(colorMode) => <LiquidityPageThumbnailIcon w="240px" colorMode={colorMode} isActive={isSwapActive} />}
        isActive={isSwapActive}
      />
      <BottomNavbarItem
        href={createHref}
        text="Create"
        icon={(colorMode) => <LaunchpadPageThumbnailIcon colorMode={colorMode} isActive={isCreateActive} />}
        isActive={isCreateActive}
      />
      <BottomNavbarItem
        href={profileHref}
        text="Profile"
        icon={(colorMode) => <PerpetualsPageThumbnailIcon colorMode={colorMode} isActive={isProfileActive} />}
        isActive={isProfileActive}
      />
      {/* <Menu size="lg" placement="top-end" offset={[0, 30]}>
        <MenuButton as="div">
          <BottomNavbarItem
            text="More"
            icon={(colorMode) => <MorePageThumbnailIcon colorMode={colorMode} isActive={false} />}
            isActive={false}
          />
        </MenuButton>
        <NavMoreButtonMenuPanel />
      </Menu> */}
    </SimpleGrid>
  )
}

function BottomNavbarItem({
  text,
  href,
  isActive,
  icon
}: {
  text: string
  href?: string
  isActive?: boolean
  icon?: ReactNode | ((colorMode: ColorMode) => ReactNode)
}) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const content = (
    <VStack spacing={'6px'}>
      <Box>{shrinkToValue(icon, [colorMode])}</Box>
      <Text
        color={isActive ? (isDark ? colors.textPrimary : colors.secondary) : colors.textSecondary}
        fontSize="9px"
        lineHeight="12px"
        fontWeight={isActive ? 500 : 400}
      >
        {text}
      </Text>
    </VStack>
  )
  return href ? (
    <Link href={href}>
      <Box>{content}</Box>
    </Link>
  ) : (
    content
  )
}
