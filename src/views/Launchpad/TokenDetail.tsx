import React, {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import Decimal from 'decimal.js'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'
import {
  Info as InfoIcon,
  X
} from 'react-feather'
import { Trans } from 'react-i18next'

import ConnectedButton from '@/components/ConnectedButton'
import { CopyButton } from '@/components/CopyButton'
import Tabs from '@/components/Tabs'
import {
  addPoolListener,
  removePoolListener
} from '@/components/TradingView/streaming'
import TVChart from '@/components/TradingView/TVChart'
import { DialogTypes } from '@/constants/dialogs'
import { LocalStorageKey } from '@/constants/localStorage'
import useCheckToken from '@/hooks/launchpad/useCheckToken'
import useMeta from '@/hooks/launchpad/useMeta'
import useMintInfo from '@/hooks/launchpad/useMintInfo'
import usePoolRpcInfo, { getMarketCapData } from '@/hooks/launchpad/usePoolRpcInfo'
import { ToLaunchPadConfig } from '@/hooks/launchpad/utils'
import useFetchCpmmRpcPoolData from '@/hooks/pool/amm/useFetchCpmmRpcPoolData'
import useFetchRpcPoolData from '@/hooks/pool/amm/useFetchRpcPoolData'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import useResponsive from '@/hooks/useResponsive'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import CommentIcon from '@/icons/misc/CommentIcon'
import {
  useAppStore,
  useDialogsStore
} from '@/store'
import { colors } from '@/theme/cssVariables/colors'
import { formatCurrency } from '@/utils/numberish/formatter'
import ToPublicKey from '@/utils/publicKey'
import {
  getTokenMetadataURL,
  wsolToSolToken
} from '@/utils/token'
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Image,
  Link,
  Text,
  useColorMode,
  useToast
} from '@chakra-ui/react'
import {
  getATAAddress,
  getPdaLaunchpadVaultId,
  LaunchpadPoolInfo
} from '@raydium-io/raydium-sdk-v2'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import Comments, { CommentAction } from './components/Comments'
import Holders from './components/Holders'
import Info from './components/Info'
import TradeBox from './components/TradeBox'
import Transactions from './components/Transactions'
import {
  createTimeDiff,
  useReferrerQuery
} from './utils'

enum Tab {
  Comments = 'Comments',
  Transactions = 'Transactions',
  Holders = 'Holders',
  Info = 'Info'
}

type TabItem<T = Tab> = {
  content: ReactNode
  label: string
  value: T
  slotToolbar?: React.ReactNode
}

const TokenDetail = () => {
  const [imgUri, setImgUri] = useState<string | undefined>(undefined)
  const { checkToken } = useCheckToken()
  const router = useRouter()
  const { isMobile, isDesktopSmall, isDesktopMedium, isDesktopLarge } = useResponsive()
  const openDialog = useDialogsStore((s) => s.openDialog)
  const programId = useAppStore((s) => s.programIdConfig.LAUNCHPAD_PROGRAM)
  const publicKey = useAppStore((s) => s.publicKey)
  const connected = useAppStore((s) => s.connected)
  const { raydium } = useAppStore((s) => ({ raydium: s.raydium }))
  const { mint: id, fromCreate } = router.query
  const referrerQuery = useReferrerQuery('?')

  const toast = useToast()
  const referralRef = useRef(0)
  const referralUrl = useMemo(() => {
    if (!publicKey) return ''
    const url = new URL(window.location.href)
    if (!url.searchParams.has('lreferrer')) url.searchParams.append('lreferrer', publicKey.toBase58())
    else url.searchParams.set('lreferrer', publicKey.toBase58())
    return url.toString()
  }, [publicKey])

  const [hiddenMintsMap, setHiddenMintsMap] = useLocalStorage<Record<string, boolean>>({
    key: LocalStorageKey.MintGraduatedBannerHidden,
    defaultValue: {}
  })

  const [poolState, setPoolState] = useState(0) // 0:normal, 1: migrating, 2: migrated
  const isMigrating = poolState === 1
  const isLanded = poolState === 2

  const mint = useMemo(() => {
    const key = Array.isArray(id) ? id[0] : id || ''
    try {
      new PublicKey(key)
      return key
    } catch (e: any) {
      return
    }
  }, [id])

  console.log("mint ==>", mint)

  const { data: mintData, mutate, isEmptyResult } = useMintInfo({ mints: [mint] })
  const mintInfo = mintData.find((m) => m.mint === mint)
  const poolId = mintInfo?.poolId

  const meta = useMeta({ shouldFetch: mintInfo && !mintInfo?.description, url: mintInfo?.metadataUrl })
  if (mintInfo && meta) {
    mintInfo.description = mintInfo.description || meta.description
  }

  const getStaticProps = () => {
    return {
      props: { title: meta ? meta.name : "" }
    }
  }

  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'

  const [isFeeDistributionBannerShown, setIsFeeDistributionBannerShown] = useLocalStorage({
    key: LocalStorageKey.IsFeeDistributionBannerShown,
    defaultValue: true
  })

  const needCheckMint = fromCreate === 'true' && isEmptyResult

  useEffect(() => {
    if (!needCheckMint) return
    let count = 0
    const interval = window.setInterval(() => {
      mutate()
      if (count++ >= 15) window.clearInterval(interval)
    }, 2000)
    return () => window.clearInterval(interval)
  }, [needCheckMint, mutate, isEmptyResult])

  useEffect(() => {
    if (!isEmptyResult) return
    const id = window.setTimeout(() => {
      mutate()
    }, 2000)
    return () => window.clearTimeout(id)
  }, [isEmptyResult, mutate])

  useEffect(() => {
    console.log("hey", raydium)
    if (raydium && raydium.connection && mint) {
      fetchImgUri()
    }
  }, [raydium, mint])

  const fetchImgUri = async () => {
    console.log("fetchImgUri ==>")
    if (raydium && raydium.connection && mint) {
      const uri = await getTokenMetadataURL(raydium.connection as any, mint)
      console.log("uri ==>", uri)
      setImgUri(uri)
    }
  }

  const {
    data: poolInfo,
    configInfo: rpcConfigInfo,
    onChain
  } = usePoolRpcInfo({
    poolId,
    mintInfo,
    refreshInterval: isMigrating ? 5 * 1000 : undefined,
    notRefresh: isLanded
  })

  const { poolKeys: ammPoolData } = useFetchRpcPoolData({
    shouldFetch: isLanded && poolInfo?.migrateType === 0,
    poolId: mintInfo?.migrateAmmId
  })

  const { data: cpmmPoolData } = useFetchCpmmRpcPoolData({
    shouldFetch: isLanded && poolInfo?.migrateType === 1,
    poolId: mintInfo?.migrateAmmId
  })

  const poolVault = ammPoolData?.vault.A?.toString() || cpmmPoolData?.vaultA?.toString()

  const configInfo = useMemo(
    () => (mintInfo?.configInfo ? ToLaunchPadConfig(mintInfo.configInfo) : rpcConfigInfo),
    [mintInfo?.configInfo.pubKey, rpcConfigInfo]
  )

  const mintBInfo = mintInfo ? wsolToSolToken(mintInfo.mintB) : undefined
  const mintB = mintBInfo?.address

  // mint B check
  const { data } = useTokenPrice({ mintList: [mintB] })

  const marketCap =
    poolInfo && mintInfo && mintB && data[mintB]
      ? getMarketCapData({
        poolInfo,
        mintInfo,
        mintBPrice: new Decimal(data[mintB].value)
      })
      : undefined

  const creator = mintInfo?.creator
  const [mintVault, ownerAta] = useMemo(() => {
    if (!mint || !creator || !poolId) return []
    return [
      getPdaLaunchpadVaultId(programId, ToPublicKey(poolId), ToPublicKey(mint)).publicKey.toBase58(),
      getATAAddress(ToPublicKey(creator), ToPublicKey(mint), TOKEN_PROGRAM_ID).publicKey.toBase58()
    ]
  }, [mint, poolId, creator, programId])

  const defaultTab = useMemo(() => (isMobile ? Tab.Info : Tab.Comments), [])
  const [value, setValue] = useState(defaultTab)
  const commentRef = useRef<CommentAction>({ loadNewComments: () => { } })

  const panelItems = useMemo(() => {
    const baseItems = [
      {
        content: <Comments actionRef={commentRef} mintInfo={mintInfo} />,
        label: 'Comments',
        value: Tab.Comments
      },
      {
        content: <Transactions poolId={poolId} mintBInfo={mintBInfo} />,
        label: 'Transactions',
        value: Tab.Transactions
      },
      {
        content: <Holders mintInfo={mintInfo} mintVault={mintVault} ownerAta={ownerAta} poolVault={poolVault} />,
        label: 'Holders',
        value: Tab.Holders
      }
    ]

    if (isMobile) {
      baseItems.push({
        content: (
          <>
            <Info
              mintInfo={mintInfo}
              poolInfo={poolInfo}
              marketCap={marketCap}
              isLanded={isLanded}
              refreshMintInfo={mutate}
              mintBPrice={mintB && data[mintB] ? new Decimal(data[mintB].value).toNumber() : undefined}
            />
            <Flex
              justifyContent="space-between"
              alignItems="center"
              position="fixed"
              bottom="66px"
              left="20px"
              right="20px"
              bg={colors.backgroundLight}
              borderRadius="20px"
              border="1px solid #ABC4FF1F"
              boxShadow="0px 8px 48px 0px #4F53F31A"
              p={3}
              gap={3}
              zIndex={1000}
            >
              <Button
                variant="outline"
                width="3.75rem"
                minWidth="3.75rem"
                height="2.625rem"
                borderRadius="8px"
                onClick={async () => {
                  const r = await checkToken({ checkTime: true })
                  if (!r) return
                  openDialog(DialogTypes.AddComment({ poolId: poolId!, onUploadSuccess: commentRef.current.loadNewComments }))
                }}
              >
                <CommentIcon color={colors.textLink} />
              </Button>
              <Button
                minWidth="15rem"
                maxWidth="100%"
                height="2.625rem"
                borderRadius="8px"
                onClick={
                  mintBInfo && configInfo
                    ? () => openDialog(DialogTypes.TradeBox({ poolInfo, mintInfo, mintBInfo, configInfo, onChain, isMigrating, isLanded }))
                    : undefined
                }
              >
                Trade
              </Button>
            </Flex>
          </>
        ),
        label: 'Info',
        value: Tab.Info
      })
    }

    return baseItems
  }, [
    mintVault,
    ownerAta,
    isMobile,
    mintInfo,
    mintBInfo?.address,
    onChain,
    configInfo,
    mutate,
    poolInfo?.mintA,
    data[mintB ?? ''],
    poolVault,
    meta
  ])

  useEffect(() => {
    if (!poolInfo && !mintInfo) return
    setPoolState(mintInfo?.migrateAmmId ? 2 : poolInfo?.status ?? 0)
  }, [poolInfo?.status, mintInfo?.migrateAmmId])

  useEffect(() => {
    if (!poolId) return
    const cbk = (data: LaunchpadPoolInfo) => setPoolState(data.status)
    addPoolListener(poolId, cbk)
    return () => removePoolListener(poolId, cbk)
  }, [poolId])

  const handleHideGraduatedBanner = useCallback(
    (mint?: string) => {
      if (!mint) return

      setHiddenMintsMap({
        ...hiddenMintsMap,
        [mint]: true
      })
    },
    [hiddenMintsMap, setHiddenMintsMap]
  )

  return (
    <Grid
      gridTemplate={[
        `
        'header' auto
        'chart' minmax(30rem, 1fr)
        'tabs' minmax(auto, 35rem)
        / 1fr
        `,
        `
        'back back' auto
        'header header' auto
        'chart side' 40rem
        'tabs side' 1fr
        / 1fr  minmax(0, 22.5rem)
        `,
        `
        'back back' auto
        'header side' auto
        'chart side' 40rem
        'tabs side' 1fr
        / 1fr minmax(0, 22.5rem)
        `
      ]}
      width="0"
      minWidth="100%"
      height="100%"
      minHeight={['100%', '800px', '1000px']}
      rowGap={[1, 4, 4]}
      columnGap={4}
    >
      <GridItem gridArea="back" display={['none', 'initial', 'initial']}>
        <Flex alignItems="center" gap={1}>
          <Link as={NextLink} href={`/${referrerQuery}`} display="contents" shallow color={colors.lightPurple}>
            <ChevronLeftIcon />
            <Text fontWeight="500" fontSize="xl">
              Back
            </Text>
          </Link>
          {!isFeeDistributionBannerShown ? (
            <Flex borderRadius="8px" background="#8C6EEF33" width="100%" px={3} py={2} ml={4} justifyContent="space-between">
              <Flex alignItems="center" lineHeight="18px">
                <Text>🤑</Text>
                <Text
                  fontSize="sm"
                  bgGradient={
                    isLight
                      ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                      : 'linear-gradient(245.22deg,rgb(239, 107, 46) 7.97%,rgb(255, 251, 43) 49.17%, rgb(239, 107, 46) 92.1%)'
                  }
                  bgClip="text"
                >
                  Rewards are LIVE for traders AND creators! Check X account for updates!
                </Text>
              </Flex>
              <X width="22px" height="22px" color="#4F53F3" cursor="pointer" onClick={() => setIsFeeDistributionBannerShown(true)} />
            </Flex>
          ) : null}
        </Flex>
      </GridItem>
      <GridItem gridArea="header">
        {mintInfo && (isMigrating || isLanded) && !hiddenMintsMap[mintInfo.mint] ? (
          <Flex justifyContent="space-between" alignItems="center" background="#22D1F833" borderRadius="8px" px={3} py={2} mb={3}>
            <Flex alignItems="center" gap={2}>
              <Box>
                <InfoIcon width="16px" height="16px" color={colors.textLaunchpadLink} />
              </Box>
              <Text fontSize="sm" color={colors.textLaunchpadLink}>
                <Trans i18nKey={`launchpad.${isLanded ? 'pool_graduated' : 'pool_migrating'}`} values={{ token: mintInfo.symbol }}>
                  <Text as="span" fontWeight="bold"></Text>
                </Trans>
              </Text>
            </Flex>
            <Box flex={0}>
              <X
                width="22px"
                height="22px"
                color={colors.textLaunchpadLink}
                cursor="pointer"
                onClick={() => handleHideGraduatedBanner(mintInfo.mint)}
              />
            </Box>
          </Flex>
        ) : null}
        {isMobile ? (
          <Flex direction="column" gap={1}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              background={isLight ? '#F5F8FF' : '#ABC4FF0A'}
              borderRadius="4px"
              px={3}
              py={2}
            >
              <Flex alignItems="center" gap={1}>
                <Image
                  src={imgUri ? imgUri : undefined}
                  fallbackSrc={mintInfo?.imgUrl}
                  borderRadius="50%"
                  width="20px"
                  height="20px"
                />
                <Text ml={1} color={colors.lightPurple} lineHeight="20px" fontWeight="medium">
                  {mintInfo?.symbol ?? '--'}
                  <Text as="span" ml={1} opacity={0.6}>
                    {mintInfo ? `(${mintInfo.name})` : null}
                  </Text>
                </Text>
              </Flex>
              <Flex alignItems="center" gap={1}>
                <Link as={NextLink} href={`/${referrerQuery}`} display="contents" shallow color={colors.lightPurple}>
                  <ChevronLeftIcon width="12px" height="12px" />
                  <Text fontWeight="500" fontSize="xs">
                    Back
                  </Text>
                </Link>
              </Flex>
            </Flex>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              background={isLight ? '#F5F8FF' : '#ABC4FF0A'}
              borderRadius="4px"
              px={3}
              py={2}
            >
              <Text fontSize="sm" color={colors.textLaunchpadLink} lineHeight="15px">
                Market cap: {mintInfo ? formatCurrency(mintInfo.marketCap, { symbol: '$', abbreviated: true, decimalPlaces: 2 }) : '--'}
              </Text>
              <Text color={colors.lightPurple} fontSize="sm" opacity={0.6} lineHeight="15px">
                {mintInfo ? `created ${createTimeDiff(mintInfo.createAt)} ago` : null}
              </Text>
            </Flex>
          </Flex>
        ) : (
          <Flex
            justifyContent="space-between"
            alignItems="center"
            background={isLight ? '#F5F8FF' : '#ABC4FF0A'}
            borderRadius="4px"
            px={3}
            py={2}
            sx={
              isLight
                ? {
                  border: '1px solid #ffdebf80'
                }
                : {}
            }
          >
            <Flex alignItems="center" gap={1}>
              <Image
                src={imgUri ? imgUri : undefined}
                fallbackSrc={mintInfo?.imgUrl}
                width="28px"
                height="28px"
                borderRadius="50%"
              />
              <Text ml={1} color={isLight ? '#000248' : colors.lightPurple} fontWeight="medium">
                {mintInfo?.symbol ?? '--'}
                <Text as="span" ml={1} opacity={0.6} color={colors.lightPurple}>
                  {mintInfo ? `(${mintInfo.name})` : null}
                </Text>
              </Text>
              <Text ml={4} fontSize="sm" color={colors.textLaunchpadLink}>
                Market cap: {mintInfo ? formatCurrency(mintInfo.marketCap, { symbol: '$', abbreviated: true, decimalPlaces: 2 }) : '--'}
              </Text>
            </Flex>
            <Text color={colors.lightPurple} fontSize="sm" opacity={0.6}>
              {mintInfo ? `created ${createTimeDiff(mintInfo.createAt)} ago` : null}
            </Text>
          </Flex>
        )}
      </GridItem>
      <GridItem gridArea="chart">
        <TVChart
          poolId={isLanded && mintInfo ? `${mintInfo.mint}_${mintB}` : poolId}
          birdeye={mintInfo && isLanded}
          mintInfo={mintInfo}
          mintBInfo={mintBInfo}
          curveType={configInfo?.curveType}
          needRefresh={needCheckMint}
        />
      </GridItem>
      <GridItem
        gridArea="tabs"
        background={isMobile ? 'transparent' : isLight ? '#F5F8FF' : '#ABC4FF0A'}
        borderRadius="4px"
        px={[0, 4, 4]}
        pt={[2, 4, 4]}
        mb={isMobile ? 0 : 4}
        sx={
          isMobile
            ? {
              '.chakra-tabs ': {
                borderRadius: '4px'
              },
              button: {
                px: 3
              }
            }
            : isLight
              ? {
                border: '1px solid #ffdebf80'
              }
              : {}
        }
      >
        {isMobile ? (
          <Flex px={4} mb="2" py="10px" borderRadius="8px" background="#8C6EEF33" alignItems="center" gap={8}>
            <Text
              fontSize="sm"
              bgGradient={
                isLight
                  ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                  : 'linear-gradient(245.22deg,rgb(239, 107, 46) 7.97%,rgb(255, 251, 43) 49.17%, rgb(239, 107, 46) 92.1%)'
              }
              bgClip="text"
            >
              Share and earn a referral from all volume using your link
            </Text>
            {connected ? (
              <CopyButton
                value={referralUrl}
                width="76px"
                minWidth="76px"
                height="28px"
                minHeight="28px"
                borderRadius="8px"
                onCopy={() => {
                  toast.close(referralRef.current)
                  referralRef.current = Date.now()
                  toastSubject.next({
                    status: 'success',
                    id: referralRef.current,
                    title: 'Copy referral url success!',
                    duration: 1500
                  })
                }}
                background={
                  isLight
                    ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                    : 'linear-gradient(245.22deg,rgb(239, 107, 46) 7.97%,rgb(255, 251, 43) 49.17%, rgb(239, 107, 46) 92.1%)'
                }
                _hover={{
                  background: isLight
                    ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                    : 'linear-gradient(245.22deg,rgb(239, 107, 46) 7.97%,rgb(255, 251, 43) 49.17%, rgb(239, 107, 46) 92.1%)'
                }}
              >
                Share
              </CopyButton>
            ) : (
              <ConnectedButton width="fit-content" height="28px" minHeight="28px" mx="auto" fontSize="sm" />
            )}
          </Flex>
        ) : null}
        <TabContent
          value={panelItems.some((item) => item.value === value) ? value : Tab.Comments}
          onValueChange={setValue}
          items={panelItems}
          slotTabRight={
            !isMobile && value === Tab.Comments ? (
              <Button
                variant="outline"
                isDisabled={!poolId}
                onClick={async () => {
                  const r = await checkToken({ checkTime: true })
                  if (!r) return
                  openDialog(DialogTypes.AddComment({ poolId: poolId!, onUploadSuccess: commentRef.current.loadNewComments }))
                }}
              >
                Add Comment
              </Button>
            ) : null
          }
          slotToolbar={
            isMobile && value === Tab.Comments ? (
              <Button
                variant="outline"
                isDisabled={!poolId}
                onClick={async () => {
                  const r = await checkToken({ checkTime: true })
                  if (!r) return
                  openDialog(DialogTypes.AddComment({ poolId: poolId!, onUploadSuccess: commentRef.current.loadNewComments }))
                }}
              >
                Add Comment
              </Button>
            ) : null
          }
        />
      </GridItem>
      <GridItem gridArea="side" display={['none', 'initial', 'initial']}>
        <Grid gap={4}>
          <TradeBox
            poolInfo={poolInfo}
            mintInfo={mintInfo}
            mintBInfo={mintBInfo}
            configInfo={configInfo}
            onChain={onChain}
            isMigrating={isMigrating}
            isLanded={isLanded}
          />
          <Flex px={4} py="10px" borderRadius="8px" background="#8C6EEF33" alignItems="center" gap={8}>
            <Text
              fontSize="sm"
              bgGradient={
                isLight
                  ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                  : 'linear-gradient(245.22deg,rgb(239, 107, 46) 7.97%,rgb(255, 251, 43) 49.17%, rgb(239, 107, 46) 92.1%)'
              }
              bgClip="text"
            >
              Share and earn a referral from all volume using your link
            </Text>
            {connected ? (
              <CopyButton
                value={referralUrl}
                width="76px"
                minWidth="76px"
                height="28px"
                minHeight="28px"
                borderRadius="8px"
                onCopy={() => {
                  toast.close(referralRef.current)
                  referralRef.current = Date.now()
                  toastSubject.next({
                    status: 'success',
                    id: referralRef.current,
                    title: 'Copy referral url success!',
                    duration: 1500
                  })
                }}
                background={
                  isLight
                    ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                    : 'linear-gradient(245.22deg,rgb(239, 107, 46) 7.97%,rgb(255, 251, 43) 49.17%, rgb(239, 107, 46) 92.1%)'
                }
                _hover={{
                  background: isLight
                    ? 'linear-gradient(245.22deg, #DA2EEF 7.97%, #2B6AFF 49.17%, #39D0D8 92.1%)'
                    : 'linear-gradient(245.22deg,rgb(239, 107, 46) 7.97%,rgb(255, 251, 43) 49.17%, rgb(239, 107, 46) 92.1%)'
                }}
              >
                Share
              </CopyButton>
            ) : (
              <ConnectedButton width="fit-content" height="28px" minHeight="28px" mx="auto" fontSize="sm" />
            )}
          </Flex>
          <Info
            poolInfo={poolInfo}
            mintInfo={mintInfo}
            marketCap={marketCap}
            mintBPrice={mintB && data[mintB] ? new Decimal(data[mintB].value).toNumber() : undefined}
            isLanded={isLanded}
            refreshMintInfo={mutate}
            imgUri={imgUri}
          />
        </Grid>
      </GridItem>
    </Grid>
  )
}

const TabContent = memo(
  ({
    value = Tab.Comments,
    onValueChange,
    items = [],
    slotTabRight,
    slotToolbar
  }: {
    value: Tab
    onValueChange?: ((value: Tab) => void) | undefined
    items: TabItem<Tab>[]
    slotTabRight?: ReactNode
    slotToolbar?: React.ReactNode
  }) => {
    const currentItem = items.find((item) => item.value === value)
    const tabItems = useMemo(
      () =>
        items.map((item) => ({
          label: item.label,
          value: item.value
        })),
      [items]
    )

    const onTabChange = (tabId: Tab) => {
      if (onValueChange) {
        onValueChange(tabId)
      }
    }

    return (
      <Grid templateRows="auto 1fr" height="100%">
        <Box overflow="auto" mb={isMobile ? 2 : 4} minH="40px">
          <Flex justifyContent="space-between">
            <Tabs size="md" variant="rounded" items={tabItems} value={value} onChange={onTabChange} />
            {slotTabRight}
          </Flex>
          {(currentItem?.slotToolbar ?? slotToolbar) && (
            <Flex alignItems="center" mt={2}>
              {currentItem?.slotToolbar ?? slotToolbar}
            </Flex>
          )}
        </Box>
        <Grid
          templateAreas="'stack'"
          sx={{
            '& > *': {
              gridArea: 'stack'
            }
          }}
        >
          {currentItem?.content}
        </Grid>
      </Grid>
    )
  }
)

export default TokenDetail
