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
  Image
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useRef } from 'react'
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
import { useReferrerQuery } from '@/views/Launchpad/utils'
import { TorqueButton } from '@/views/Torque'

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

  return (
    <Flex direction="column" id="app-layout" height="full" overflow={overflowHidden ? 'hidden' : 'auto'}>
      <HStack
        className="navbar"
        flex="none"
        height={['64px', '80px']}
        px={['20px', '20px', '38px']}
        // gap={['4px', '32px', '48px', 'max(64px, 6.1vw)']}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* logo */}
        <Desktop>
          <Box flex={'none'} mr={['', "-16", "-28", "-44"]}>
            <Link href="/">
              <Flex gap="1.5">
                <Image src='/logo.png' w={['0', '12', '14', '16']} />
                <Box mt={['0', '3', '3', '3']}>
                  <Image src='/logo-text.png' h={['0', '6', '8', '10']} />
                </Box>
              </Flex>
            </Link>
          </Box>
        </Desktop>
        <Mobile>
          <HStack>
            <Image src='/logo.png' w="12" />
            <Image src='/logo-text.png' h='6' />
          </HStack>
        </Mobile>

        {/* nav routes */}
        <Desktop>
          <HStack flexGrow={1} justify="center" overflow={['auto', 'visible']} gap={[15, 0, 15]}>
            <RouteLink href="/" isActive={pathname === '/'} title="Board" />
            <RouteLink href="/create" isActive={pathname === '/create'} title="Launch New" />
            <RouteLink href="/profile" isActive={pathname === '/profile'} title="Profile" />
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
          </HStack>
        </Desktop>

        {/* wallet button */}
        <Flex gap={[0.5, 2]} align="center">
          {/* <TorqueButton /> */}
          {/* <PriorityButton /> */}
          {/* <SettingsMenu /> */}
          {/* <EVMWallet />  don't need currently yet*/}
          <SolWallet />
        </Flex>
      </HStack>

      <Box
        px={appLayoutPaddingX}
        pt={[0, 4]}
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
      <Mobile>
        <Box className="mobile_bottom_navbar" flex="none">
          <MobileBottomNavbar />
        </Box>
      </Mobile>
    </Flex>
  )
}

function RouteLink({
  href,
  isActive,
  title,
  external = false,
  sx,
  slotAfter
}: {
  href: string
  isActive: boolean
  title: string | React.ReactNode
  external?: boolean
  sx?: SystemStyleObject
  slotAfter?: ReactNode
}) {
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
        fontSize={['md', 'md', 'lg']}
        px={4}
        py={2}
        rounded="xl"
        transition="200ms"
        _hover={{ bg: colors.backgroundLight, color: colors.textSecondary }}
        alignItems="center"
        sx={sx}
      >
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
