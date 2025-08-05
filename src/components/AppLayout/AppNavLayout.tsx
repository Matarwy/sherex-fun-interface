import { useDisclosure } from '@/hooks/useDelayDisclosure'
import RaydiumLogo from '@/icons/RaydiumLogo'
import RaydiumLogoOutline from '@/icons/RaydiumLogoOutline'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import Gear from '@/icons/misc/Gear'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { appLayoutPaddingX } from '@/theme/detailConfig'
import {
  Box,
  Flex,
  HStack,
  Menu,
  MenuButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  SystemStyleObject,
  Image,
  VStack,
  ColorMode,
  useColorMode
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useRef, useState } from 'react'
import { Desktop, Mobile } from '../MobileDesktop'
import SolWallet from '../SolWallet'
import { MobileBottomNavbar } from './MobileBottomNavbar'
import { ColorThemeSettingField } from './components/ColorThemeSettingField'
import { DefaultExplorerSettingField } from './components/DefaultExplorerSettingField'
import { NavMoreButtonMenuPanel } from './components/NavMoreButtonMenuPanel'
import { RPCConnectionSettingField } from './components/RPCConnectionSettingField'
import { Divider } from './components/SettingFieldDivider'
import { SlippageToleranceSettingField } from './components/SlippageToleranceSettingField'
import { VersionedTransactionSettingField } from './components/VersionedTransactionSettingField'
import { PriorityButton } from './components/PriorityButton'
import TagNewIcon from '@/icons/misc/TagNewIcon'
import { shrinkToValue } from '@/utils/shrinkToValue'
import { useReferrerQuery } from '@/views/Launchpad/utils'
import { TorqueButton } from '@/views/Torque'
import MorePageThumbnailIcon from '@/icons/pageNavigation/MoreThumbnailIcon'
import SwapPageThumbnailIcon from '@/icons/pageNavigation/SwapPageThumbnailIcon'
import LaunchpadPageThumbnailIcon from '@/icons/pageNavigation/LaunchpadPageThumbnailIcon'
import UserIcon from '@/icons/misc/UserIcon'
import TelegrameIcon from '@/icons/misc/TelegrameIcon'
import TwitterIcon from '@/icons/misc/TwitterIcon'
import { Instagram } from 'react-feather'
import Button from '../Button'
import Close from '@/icons/misc/Close'
import { useHover } from '@/hooks/useHover'

export interface NavSettings {
  // colorTheme: 'dark' | 'light'
}

function AppNavLayout({
  children,
  overflowHidden
}: {
  children: ReactNode
  /** use screen height */
  overflowHidden?: boolean
}) {
  const { pathname } = useRouter()
  const queryReferrer = useReferrerQuery('?')

  const boardHref = '/'
  const isBoardActive = pathname === boardHref
  const swapHref = '/swap'
  const isSwapActive = pathname === swapHref
  const createHref = '/create'
  const isCreateActive = pathname === createHref
  const profileHref = '/profile'
  const isProfileActive = pathname === profileHref

  const [isOpen, setIsOpen] = useState(false)

  const targetElement = useRef<HTMLDivElement | null>(null)

  const isHover = useHover(targetElement)

  return (
    <Flex direction="column" id="app-layout" height="full" overflow={overflowHidden ? 'hidden' : 'auto'}>
      <HStack
        className="navbar"
        flex="none"
        height='64px'
        px={['12px', '20px', '38px']}
        // gap={['4px', '32px', '48px', 'max(64px, 6.1vw)']}
        alignItems="center"
        justifyContent="space-between"
        // bg={colors.backgroundMedium}
        borderBottom="1px solid"
        borderColor={colors.textTertiary}
      >
        <Desktop>
          <Box flex={'none'} mr={['', "-24", "-36", "-36"]}>
            <Link href="/">
              <Flex gap="1.5">
                <Image src='/logo.png' w={['0', '12', '14', '14']} />
                <Box mt={['3', '3', '3', '3']}>
                  <Image src='/logo-text.png' h={['6', '6', '8', '8']} />
                </Box>
              </Flex>
            </Link>
          </Box>
        </Desktop>
        <Mobile>
          <HStack>
            <Flex gap="4" alignItems="center">
              <Image src='/logo.png' w="12" />
              {/* <Image src='/logo-text.png' h='6' /> */}
              <Box 
                style={{cursor: 'pointer'}}
                onClick={() => setIsOpen(!isOpen)}
                ref={targetElement}
              >
                {!isOpen && <MorePageThumbnailIcon isActive color={isHover ? colors.textPrimary : colors.textTertiary} width={24} height={24} />}
                {isOpen && <Close width={16} height={16} fill={isHover ? colors.textPrimary : colors.textTertiary} />}
              </Box>
            </Flex>
          </HStack>
        </Mobile>
        <Flex gap={[0.5, 2]} align="center">
          <SolWallet />
        </Flex>
      </HStack>
      <Flex direction="row" height="full" position="relative">
        <Desktop>
          <VStack
            className="navbar"
            w="240px"
            py="12px"
            alignItems="center"
            justifyContent="space-between"
            borderRight="1px solid"
            borderColor={colors.textTertiary}
          >
            {/* nav routes */}
            <VStack w="full" alignItems="left" flexGrow={1} overflow={['auto', 'visible']} gap={15}>
              <RouteLink 
                href="/" 
                icon={(colorMode) => <MorePageThumbnailIcon colorMode={colorMode} isActive={isBoardActive} width={20} height={20} />}
                isActive={isBoardActive} 
                title="Board" 
              />
              <RouteLink 
                href="/swap" 
                icon={(colorMode) => <SwapPageThumbnailIcon colorMode={colorMode} isActive={isSwapActive} width={20} height={20} />}
                isActive={isSwapActive} 
                title="Swap" 
              />
              <RouteLink 
                href="/create" 
                icon={(colorMode) => <LaunchpadPageThumbnailIcon colorMode={colorMode} isActive={isCreateActive} width={20} height={20} />}
                isActive={isCreateActive} 
                title="Launch New" 
              />
              <RouteLink 
                href="/profile" 
                icon={(colorMode) => <UserIcon colorMode={colorMode} isActive={isProfileActive} width={20} height={20} />}
                isActive={isProfileActive} 
                title="Profile" 
              />
              {/* <Menu size="lg">
                <MenuButton fontSize={'lg'} px={4} py={2}>
                  <Flex
                    align="center"
                    gap={0.5}
                    color={pathname === '/staking' || pathname === '/bridge' ? colors.textSecondary : colors.textTertiary}
                  >
                    {pathname === '/staking' ? t('staking.title') : pathname === '/bridge' ? t('bridge.title') : t('common.more')}
                    <ChevronDownIcon width={16} height={16} />
                  </Flex>
                </MenuButton>
                <NavMoreButtonMenuPanel />
              </Menu> */}
            </VStack>

            {/* wallet button */}
            {/* <Flex gap={[0.5, 2]} align="center">
              <SolWallet />
            </Flex> */}
            <VStack w="full" alignItems="left" gap={1}>
              <Box w="full" borderTop="1px solid" borderColor={colors.textTertiary} />
              <RouteLink 
                href="/" 
                icon={<TelegrameIcon color={colors.textTertiary} width={20} height={20} />}
                isActive={false} 
                title="Telegram" 
              />
              <RouteLink 
                href="/" 
                icon={<TwitterIcon color={colors.textTertiary} width={20} height={20} />}
                isActive={false} 
                title="Twitter" 
              />
              <RouteLink 
                href="/" 
                icon={<Instagram color={colors.textTertiary} width={20} height={20} />}
                isActive={false} 
                title="Instagram" 
              />
            </VStack>
          </VStack>
        </Desktop>
        {isOpen && <Mobile>
          <Flex
            w="full"
            h="full"
            position="fixed"
            zIndex="10"
            backdropFilter={isOpen ? "blur(10px)" : "none"}
            style={{
              transition: "padding-top 0.2s, width 0.2s",
              transform: "translate3d(0, 0, 0)",
              flexShrink: 0
            }}
          >
            <VStack
              className="navbar"
              w="240px"
              py="12px"
              height="calc(100vh - 64px)"
              alignItems="center"
              justifyContent="space-between"
              borderRight="1px solid"
              borderColor={colors.textTertiary}
              bg={colors.backgroundDark}
            >
              {/* nav routes */}
              <VStack w="full" alignItems="left" flexGrow={1} overflow={['auto', 'visible']} gap={15}>
                <Box onClick={() => setIsOpen(false)}>
                  <RouteLink 
                    href="/" 
                    icon={(colorMode) => <MorePageThumbnailIcon colorMode={colorMode} isActive={isBoardActive} width={20} height={20} />}
                    isActive={isBoardActive} 
                    title="Board"
                  />
                </Box>
                <Box onClick={() => setIsOpen(false)}>
                  <RouteLink 
                    href="/swap" 
                    icon={(colorMode) => <SwapPageThumbnailIcon colorMode={colorMode} isActive={isSwapActive} width={20} height={20} />}
                    isActive={isSwapActive} 
                    title="Swap" 
                  />
                </Box>
                <Box onClick={() => setIsOpen(false)}>
                  <RouteLink 
                    href="/create" 
                    icon={(colorMode) => <LaunchpadPageThumbnailIcon colorMode={colorMode} isActive={isCreateActive} width={20} height={20} />}
                    isActive={isCreateActive} 
                    title="Launch New" 
                  />
                </Box>
                <Box onClick={() => setIsOpen(false)}>
                  <RouteLink 
                    href="/profile" 
                    icon={(colorMode) => <UserIcon colorMode={colorMode} isActive={isProfileActive} width={20} height={20} />}
                    isActive={isProfileActive} 
                    title="Profile" 
                  />
                </Box>
              </VStack>
              <VStack w="full" alignItems="left" gap={1}>
                <Box w="full" borderTop="1px solid" borderColor={colors.textTertiary} mb="2px" />
                <RouteLink 
                  href="https://x.com"
                  external 
                  icon={<TwitterIcon color={colors.textTertiary} width={20} height={20} />}
                  isActive={false} 
                  title="Twitter" 
                />
                <RouteLink 
                  href="https://t.me/"
                  external 
                  icon={<TelegrameIcon color={colors.textTertiary} width={20} height={20} />}
                  isActive={false} 
                  title="Telegram" 
                />
                <RouteLink 
                  href="https://instagram.com"
                  external 
                  icon={<Instagram color={colors.textTertiary} width={20} height={20} />}
                  isActive={false} 
                  title="Instagram" 
                />
              </VStack>
            </VStack>
            <VStack
              w="calc(100vw - 240px)"
              onClick={() => setIsOpen(false)}
            />
          </Flex>
        </Mobile>}

        <Box
          px={appLayoutPaddingX}
          pt={[4, 4]}
          flex={1}
          overflow={overflowHidden ? 'hidden' : 'auto'}
          display="flex"
          flexDirection="column"
          justifyItems={'flex-start'}
          sx={{
            scrollbarGutter: 'stable',
            contain: 'size',
            '& > *': {
              // for flex-col container
              flex: 'none'
            }
          }}
        >
          {children}
        </Box>
        {/* <Mobile>
          <Box className="mobile_bottom_navbar" flex="none">
            <MobileBottomNavbar />
          </Box>
        </Mobile> */}
      </Flex>
    </Flex>
  )
}

function RouteLink({
  href,
  icon,
  isActive,
  title,
  external = false,
  sx,
  slotAfter
}: {
  href: string
  icon?: ReactNode | ((colorMode: ColorMode) => ReactNode)
  isActive: boolean
  title: string | React.ReactNode
  external?: boolean
  sx?: SystemStyleObject
  slotAfter?: ReactNode
}) {
  const { colorMode } = useColorMode()
  return (
    <Link
      href={href}
      shallow
      {...(external
        ? {
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        : {})}
    >
      <Flex
        textColor={isActive ? colors.textSecondary : colors.textTertiary}
        fontSize='md'
        px={4}
        py={2}
        rounded="md"
        transition="200ms"
        _hover={{ bg: colors.cardStackBg }}
        alignItems="center"
        sx={sx}
        gap="6px"
        bg={isActive ? colors.cardStackBg : "transparent"}
      >
        <Box>{shrinkToValue(icon, [colorMode])}</Box>
        {title}
        {slotAfter}
      </Flex>
    </Link>
  )
}

function SettingsMenu() {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const triggerRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <Box
        w={10}
        h={10}
        p="0"
        onClick={() => onOpen()}
        _hover={{ bg: colors.backgroundLight }}
        rounded="full"
        display="grid"
        placeContent="center"
        cursor="pointer"
        ref={triggerRef}
      >
        <Gear />
      </Box>
      <SettingsMenuModalContent isOpen={isOpen} onClose={onClose} triggerRef={triggerRef} />
    </>
  )
}

function SettingsMenuModalContent(props: { isOpen: boolean; triggerRef: React.RefObject<HTMLDivElement>; onClose: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const triggerPanelGap = 8
  const isMobile = useAppStore((s) => s.isMobile)
  const getTriggerRect = () => props.triggerRef.current?.getBoundingClientRect()

  return (
    <Modal size={'lg'} isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent
        css={{
          transform: (() => {
            const triggerRect = getTriggerRect()
            return (
              triggerRect
                ? `translate(${isMobile ? 0 : -(window.innerWidth - triggerRect.right)}px, ${
                    triggerRect.bottom + triggerPanelGap
                  }px) !important`
                : undefined
            ) as string | undefined
          })()
        }}
        ref={contentRef}
        marginTop={0}
        marginRight={['auto', 0]}
      >
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SlippageToleranceSettingField />
          <Divider />
          <VersionedTransactionSettingField />
          <Divider />
          <DefaultExplorerSettingField />
          <Divider />
          <ColorThemeSettingField />
          <Divider />
          <RPCConnectionSettingField />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default AppNavLayout
