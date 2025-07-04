import React, { KeyboardEvent, useRef, useState, useCallback, useEffect } from 'react'
import {
  Collapse,
  Divider,
  Flex,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  TabList,
  Tabs,
  Tab
} from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { SOLMint } from '@raydium-io/raydium-sdk-v2'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import DecimalInput from '@/components/DecimalInput'
import { colors } from '@/theme/cssVariables'
import { useAppStore, PriorityLevel, PriorityMode, PRIORITY_LEVEL_KEY, PRIORITY_MODE_KEY } from '@/store/useAppStore'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import WarningIcon from '@/icons/misc/WarningIcon'
import { formatCurrency } from '@/utils/numberish/formatter'
import { setStorageItem } from '@/utils/localStorage'
import { useEvent } from '@/hooks/useEvent'

export function PriorityModalContent(props: {
  isOpen: boolean
  triggerRef: React.RefObject<HTMLDivElement>
  currentFee: string | undefined
  onChangeFee: (val: string) => void
  onSaveFee: () => void
  onClose: () => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const triggerPanelGap = 24
  const isMobile = useAppStore((s) => s.isMobile)

  const feeConfig = useAppStore((s) => s.feeConfig)
  const appPriorityLevel = useAppStore((s) => s.priorityLevel)
  const appPriorityMode = useAppStore((s) => s.priorityMode)

  const getTriggerRect = () => props.triggerRef.current?.getBoundingClientRect()
  const { currentFee, onChangeFee, onSaveFee, isOpen } = props
  const feeWarn = Number(currentFee) <= (feeConfig[0] ?? 0)

  const [priorityMode, setPriorityMode] = useState(PriorityMode.MaxCap)
  const [priorityLevel, setPriorityLevel] = useState(PriorityLevel.Turbo)

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }, [])

  const handlePriorityLevelChange = useCallback((index: number) => {
    setPriorityLevel(index)
  }, [])
  const handlePriorityModeChange = useCallback((index: number) => {
    setPriorityMode(index)
  }, [])

  const handleSave = useEvent(() => {
    setStorageItem(PRIORITY_LEVEL_KEY, priorityLevel)
    setStorageItem(PRIORITY_MODE_KEY, priorityMode)
    useAppStore.setState({
      priorityLevel,
      priorityMode
    })
    onSaveFee()
  })

  const { data: tokenPrice } = useTokenPrice({
    mintList: [SOLMint.toBase58()]
  })
  const price = tokenPrice[SOLMint.toBase58()]?.value
  const totalPrice = price && currentFee ? new Decimal(price ?? 0).mul(currentFee).toString() : ''

  useEffect(() => {
    setPriorityLevel(appPriorityLevel)
    setPriorityMode(appPriorityMode)
  }, [appPriorityLevel, appPriorityMode, isOpen])

  return (
    <Modal size={'md'} isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent
        css={{
          transform: (() => {
            const triggerRect = getTriggerRect()
            return (
              triggerRect ? `translate(${isMobile ? 0 : -38}px, ${triggerRect.bottom + triggerPanelGap}px) !important` : undefined
            ) as string | undefined
          })()
        }}
        ref={contentRef}
        marginTop={0}
        marginRight={['auto', 0]}
        borderRadius="20px"
        border={`1px solid ${colors.backgroundDark}`}
        boxShadow="0px 8px 48px 0px #4F53F31A"
        paddingInline="2rem"
      >
        <ModalHeader>
          <HStack spacing="6px">
            <Text>Transaction Priority Fee</Text>
            <QuestionToolTip
              label={
                <Text as="span" fontSize="sm">
                  The priority fee is paid to the Solana network. This additional fee boosts transaction prioritization, resulting in faster execution times. Note that the fee is taken even if a transaction ultimately fails.
                </Text>
              }
              iconProps={{ color: colors.textSecondary }}
            />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack gap={4}>
            <Text fontSize="md" color={colors.textQuaternary}>
              Fee settings are applied across all features.
            </Text>
            <Divider />
            <Collapse in={priorityMode === 0} animateOpacity style={{ width: '100%' }}>
              <VStack width="full" align="flex-start">
                <Text fontSize="sm" color={colors.textSecondary}>
                  Priority Level
                </Text>
                <Tabs index={priorityLevel} w="full" variant="roundedLight" bg={colors.backgroundDark} onChange={handlePriorityLevelChange}>
                  <TabList>
                    <Tab
                      flex="1"
                      fontSize="xs"
                      fontWeight="normal"
                      color={colors.textSecondary}
                      opacity={0.5}
                      sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg', opacity: 1 } }}
                    >
                      <Text>Fast</Text>
                    </Tab>
                    <Tab
                      flex="1"
                      fontSize="xs"
                      fontWeight="normal"
                      color={colors.textSecondary}
                      opacity={0.5}
                      sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg', opacity: 1 } }}
                    >
                      <Text>Turbo</Text>
                    </Tab>
                    <Tab
                      flex="1"
                      fontSize="xs"
                      fontWeight="normal"
                      color={colors.textSecondary}
                      opacity={0.5}
                      sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg', opacity: 1 } }}
                    >
                      <Text>Ultra</Text>
                    </Tab>
                  </TabList>
                </Tabs>
              </VStack>
              <Divider />
            </Collapse>
            <VStack width="full" align="stretch" gap={3}>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color={colors.textSecondary}>
                  Priority Mode
                </Text>
                <Tabs variant="roundedLight" bg={colors.backgroundDark} index={priorityMode} onChange={handlePriorityModeChange}>
                  <TabList>
                    <Tab
                      fontSize="xs"
                      fontWeight="normal"
                      color={colors.textSecondary}
                      opacity={0.5}
                      sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg', opacity: 1 } }}
                    >
                      <Text>Max Cap</Text>
                    </Tab>
                    <Tab
                      fontSize="xs"
                      fontWeight="normal"
                      color={colors.textSecondary}
                      opacity={0.5}
                      sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg', opacity: 1 } }}
                    >
                      <Text>Exact Fee</Text>
                    </Tab>
                  </TabList>
                </Tabs>
              </Flex>
              <Text fontSize="md" opacity={0.5} color={colors.textPrimary}>
                {priorityMode === 0 ? 'Sherex.fun auto-optimizes priority fees for your transaction. Set a max cap to prevent overpaying.' : 'Transactions will use the exact fee set below.'}
              </Text>
              <Flex justify="space-between">
                <Text fontSize="sm" color={colors.textSecondary}>
                  {priorityMode === 0 ? 'Set Max Cap' : 'Exact Fee'}
                </Text>
                <Text fontSize="sm" opacity={0.5} color={colors.textPrimary}>
                  {`~${formatCurrency(totalPrice, { symbol: '$', decimalPlaces: 2 })}`}
                </Text>
              </Flex>
              <DecimalInput
                postFixInField
                width="100%"
                variant="filledDark"
                value={currentFee === undefined ? '' : String(currentFee)}
                placeholder='Enter custom value'
                onChange={onChangeFee}
                onKeyDown={handleKeyDown}
                inputSx={{ textAlign: 'right', rounded: '40px', h: '34px', w: '12 0px', py: 0, px: '3' }}
                ctrSx={{ bg: colors.backgroundDark, borderRadius: '32px' }}
                inputGroupSx={{ w: '100%', bg: colors.backgroundDark, alignItems: 'center', borderRadius: '32px' }}
                postfix={
                  <Text variant="label" size="sm" whiteSpace="nowrap">
                    SOL
                  </Text>
                }
              />
            </VStack>
            {feeWarn && (
              <Flex
                px={4}
                py={2}
                bg={colors.warnButtonLightBg}
                color={colors.semanticWarning}
                fontSize="sm"
                fontWeight="medium"
                borderRadius="8px"
                w="full"
              >
                <Text pt={0.5}>
                  <WarningIcon />
                </Text>
                <Text pl={2}>Your current max fee is below market rate. Increase it to ensure your transactions are processed.</Text>
              </Flex>
            )}
            <Divider />
            <Button
              w="full"
              rounded="lg"
              mt="1rem"
              background={colors.solidButtonBg}
              isDisabled={Number(currentFee) <= 0}
              onClick={handleSave}
            >
              <Text fontSize="md" fontWeight="medium" bgClip="text" color={colors.buttonSolidText}>
                Save
              </Text>
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
