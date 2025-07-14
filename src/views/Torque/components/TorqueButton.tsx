import { Badge, Box, useDisclosure } from '@chakra-ui/react'

import Button from '@/components/Button'
import { useWallet } from '@solana/wallet-adapter-react'
import TorqueDrawer from './TorqueDrawer'
import { useTorqueData } from '../hooks/useTorqueData'

export default function TorqueButton() {
  const { wallet } = useWallet()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { handleClaimOffer, loading, error, activeOffersCount, campaigns } = useTorqueData({ wallet })

  return (
    <>
      <Button variant="ghost" onClick={onOpen} display="flex" alignItems="center" gap={2}>
        <Box as="span" bgGradient="linear-gradient(245.22deg,rgb(239, 107, 46) 7.97%,rgb(255, 251, 43) 49.17%, rgb(239, 107, 46) 92.1%)" bgClip="text">
          Rewards
        </Box>
        {activeOffersCount > 0 && <Badge variant="crooked">{activeOffersCount}</Badge>}
      </Button>

      {isOpen && (
        <TorqueDrawer
          isOpen={isOpen}
          onClose={onClose}
          handleClaimOffer={handleClaimOffer}
          campaignsLoading={loading}
          campaignsError={error}
          campaigns={campaigns}
        />
      )}
    </>
  )
}
