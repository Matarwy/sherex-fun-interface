import { useEffect, useMemo, useState, useRef } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Grid,
  Text,
  Flex,
  useColorMode
} from '@chakra-ui/react'
import { NumericFormat } from 'react-number-format'
import { DialogProps, InitialBuyDialogProps } from '@/constants/dialogs'
import { colors } from '@/theme/cssVariables'
import { detectedSeparator, trimTrailZero } from '@/utils/numberish/formatter'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import { useLaunchpadStore } from '@/store'
import shallow from 'zustand/shallow'
import { LaunchpadPoolInfo, Curve, LaunchpadPoolInitParam } from '@raydium-io/raydium-sdk-v2'
import { Keypair } from '@solana/web3.js'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import { useEvent } from '@/hooks/useEvent'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { useRouter } from 'next/router'
import useCheckToken from '@/hooks/launchpad/useCheckToken'
import Turnstile, { ActionRef } from '@/components/Turnstile'
import { useLaunchPadShareInfo, useReferrerQuery } from '@/views/Launchpad/utils'
import { ToLaunchPadConfig } from '@/hooks/launchpad/utils'
import { usePlatformInfo } from '@/hooks/launchpad/usePlatformInfo'
import { uploadFile } from '@/utils/file/upload'
// import { useWallet } from '@solana/wallet-adapter-react'

export const InitialBuyDialog = ({ setIsOpen, configInfo, ...mintData }: DialogProps<InitialBuyDialogProps>) => {
  // const { signTransaction } = useWallet();
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const { isOpen: isLoading, onOpen: onLoading, onClose: offLoading } = useDisclosure()
  const { isOpen: isCreateLoading, onOpen: onCreateLoading, onClose: offCreateLoading } = useDisclosure()
  const [createMintAct, createRandomMintAct, createAndBuyAct] = useLaunchpadStore(
    (s) => [s.createMintAct, s.createRandomMintAct, s.createAndBuyAct],
    shallow
  )
  const router = useRouter()
  const { checkToken } = useCheckToken()
  const [poolInfo, setPoolInfo] = useState<LaunchpadPoolInfo>()
  const referrerQuery = useReferrerQuery('&')
  const { wallet, shareFeeRate } = useLaunchPadShareInfo()
  const platformInfo = usePlatformInfo({ platformId: LaunchpadPoolInitParam.platformId })

  const [amount, setAmount] = useState('')
  const amountRef = useRef('')
  const [outAmount, setOutAmount] = useState('')
  const [showTurstile, setShowTurnStile] = useState(false)
  const thousandSeparator = useMemo(() => (detectedSeparator === ',' ? '.' : ','), [])
  const turnstileRef = useRef<ActionRef>(null)

  const handleAmountChange = useEvent((val: string) => {
    if (!poolInfo || !val || typeof val !== 'string') return ''
    try {
      const buyResult = Curve.buyExactIn({
        poolInfo,
        amountB: new BN(new Decimal(val || '0').mul(10 ** (configInfo.mintInfoB?.decimals ?? 9)).toFixed(0)),
        protocolFeeRate: new BN(configInfo.key.tradeFeeRate),
        platformFeeRate: platformInfo?.feeRate ?? new BN(7500),
        curveType: configInfo.key.curveType,
        shareFeeRate,
        creatorFeeRate: new BN(0), // or use the correct value if available
        transferFeeConfigA: undefined, // or use the correct value if available
        slot: 0 // or use the correct value if available
      })
      
      return trimTrailZero(
        new Decimal(buyResult.amountA.toString())
          .div(10 ** poolInfo.mintDecimalsA)
          .toFixed(poolInfo.mintDecimalsA)
      )
    } catch (error) {
      console.error('Error in handleAmountChange:', error)
      return ''
    }
  })

  useEffect(() => {
    async function getTempInfo() {
      try {
        const { poolInfo } = await createAndBuyAct({
          mint: Keypair.generate().publicKey.toBase58(),
          symbol: mintData.ticker,
          mintBInfo: configInfo.mintInfoB,
          configInfo: ToLaunchPadConfig(configInfo.key),
          configId: configInfo.key.pubKey,
          uri: 'https://',
          decimals: 6,
          buyAmount: new BN(1),
          notExecute: true,
          ...mintData,
          mintKp: Keypair.generate()
        })

        setPoolInfo(poolInfo)
        setTimeout(() => {
          if (amountRef.current && typeof amountRef.current === 'string') {
            handleAmountChange(amountRef.current)
          }
        }, 100)
      } catch (error) {
        console.error('Error getting temp info:', error)
      }
    }
    getTempInfo()
  }, [mintData.name, configInfo.key.pubKey, mintData.tag])

  const handleClickBuy = async () => {
    onLoading()
    const result = await checkToken({ checkTime: true })
    if (!result) {
      offLoading()
      return
    }
    try {
      console.log("before callling tempMintData..")
      // const uri =await uploadFile(mintData.file)
      const tempMintData = await createRandomMintAct({
        ...mintData,
        configId: configInfo.key.pubKey,
        symbol: mintData.ticker
      })

      const mintKp = Keypair.generate()
      const mint = mintKp.publicKey.toBase58()
      console.log("mint======>", mint)

      if (!tempMintData) {
        toastSubject.next({})
        return
      }

      console.log("tempMintData======>", tempMintData)

      
      console.log("amount======>", amount)
      // let _amount = 0.0001

      const buyAmount = new BN(new Decimal(amount).mul(10 ** 9).toString())
      console.log("buyAmount======>", buyAmount.toString())
      console.log("before callilng here..");
      await createAndBuyAct({
        ...mintData,
        mint: mintKp.publicKey.toBase58(),
        uri: tempMintData.metadataLink,
        name: mintData.name,
        symbol: mintData.ticker,
        decimals: 6,
        mintBInfo: configInfo.mintInfoB,
        buyAmount: buyAmount,
        configInfo: ToLaunchPadConfig(configInfo.key),
        configId: configInfo.key.pubKey,
        slippage: new BN((useLaunchpadStore.getState().slippage * 10000).toFixed(0)),
        migrateType: mintData.migrateType || 'amm',
        shareFeeReceiver: wallet,
        mintKp: mintKp,
        onConfirmed: () => {
          router.push(`/token?mint=${mint}&fromCreate=true${referrerQuery}`)
        }
      })
      setIsOpen(false)
    } catch (e: any) {
      console.log("error======>", e)
      toastSubject.next({
        status: 'error',
        title: 'Create and Buy Token Error',
        description: e.message
      })
      //
    }
    offLoading()
  }

  const handleClickInitOnly = async () => {
    onCreateLoading()
    const result = await checkToken({ checkTime: true })
    if (!result) {
      offCreateLoading()
      return
    }
    if (!showTurstile) {
      toastSubject.next({
        status: 'warning',
        title: 'Human Validation required',
        description: 'Please complete validation'
      })
      setShowTurnStile(true)
      offCreateLoading()
      return
    }
    const turnstile = turnstileRef.current?.validate()
    if (!turnstile) {
      toastSubject.next({
        status: 'warning',
        title: 'Human Validation required',
        description: 'Please complete validation'
      })
      offCreateLoading()
      return
    }
    try {
      // mint B check
      
      const mint = await createMintAct({
        ...mintData,
        configId: configInfo.key.pubKey,
        symbol: mintData.ticker,
        cfToken: turnstile
      })

      toastSubject.next({
        status: 'success',
        title: 'Token Initialized',
        description: 'Token init successfully'
      })
      router.push(`/token?mint=${mint}${referrerQuery}`)

      setIsOpen(false)
    } catch (e: any) {
      toastSubject.next({
        status: 'error',
        title: 'Init Token Error',
        description: e.message
      })
    }
    offCreateLoading()
  }

  return (
    <Modal isOpen onClose={() => setIsOpen(false)} isCentered={true}>
      <ModalOverlay />
      <ModalContent
        background={colors.backgroundLight}
        p={4}
        borderRadius="20px"
        width="500px"
        maxWidth="500px"
        sx={
          isLight
            ? {}
            : {
                border: '1px solid #0B1022',
                boxShadow: ' 0px 8px 48px 0px #4F53F31A;'
              }
        }
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="medium">
            Will You Initial Buy?
          </Text>
          <ModalCloseButton position="static" />
        </Flex>
        <ModalBody mt={8}>
          <Text color={colors.lightPurple}>Buying a small amount of tokens helps protect your token from snipers. (required.)</Text>
          <Grid rowGap={3} mt={7} mb={4}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              borderRadius="12px"
              background={colors.backgroundDark}
              width="100%"
              minHeight="100%"
              height="3.75rem"
              overflow="hidden"
              gap={2}
              px={4}
            >
              <NumericFormat
                inputMode="decimal"
                value={amount}
                autoComplete="off"
                min={0}
                // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {}}
                onValueChange={(data: { value: string; formattedValue: string }) => {
                  const value = data.value || ''
                  setAmount(value)
                  amountRef.current = value
                  setOutAmount(handleAmountChange?.(value) ?? '')
                }}
                decimalSeparator={detectedSeparator}
                thousandSeparator={thousandSeparator}
                allowedDecimalSeparators={['.', ',']}
                decimalScale={9}
                allowLeadingZeros={false}
                allowNegative={false}
                autoFocus={true}
                valueIsNumericString
                placeholder=""
                style={{
                  fontWeight: '500',
                  fontSize: '20px',
                  lineHeight: '26px',
                  flex: 1,
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  minWidth: 0,
                  border: 'none',
                  background: colors.backgroundDark
                }}
              />
              <Text color={colors.lightPurple} fontWeight="medium" fontSize="xl" lineHeight="26px" userSelect="none" whiteSpace="nowrap">
                {configInfo.mintInfoB.symbol}
              </Text>
            </Flex>
            <Text color={colors.lightPurple}>
              You receive: {outAmount || '--'} {mintData.ticker}
            </Text>
            <Turnstile actionRef={turnstileRef} show={showTurstile} sx={{ mx: 'auto' }} />
            <Text color={colors.semanticWarning} mt={5}>
              May take a few seconds to upload image data
            </Text>
          </Grid>
        </ModalBody>
        <ModalFooter gap={1} flexDirection="column">
          <Button
            width="100%"
            height="3rem"
            lineHeight="24px"
            isDisabled={isCreateLoading || !amount || (amount ? new Decimal(amount).lte(0) : false)}
            isLoading={isLoading}
            loadingText="Buying..."
            onClick={handleClickBuy}
          >
            Create & Buy
          </Button>
          {/* <Button
            width="100%"
            height="3rem"
            variant="outline"
            lineHeight="24px"
            isDisabled={isLoading}
            isLoading={isCreateLoading}
            loadingText="Creating..."
            onClick={handleClickInitOnly}
          >
            Just Create
          </Button> */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
