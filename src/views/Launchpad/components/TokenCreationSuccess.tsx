import { Avatar, Box, Flex, Text, useToast, Image, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { colors } from '@/theme/cssVariables/colors'
import { CopyButton } from '@/components/CopyButton'
import ShareIcon from '@/icons/misc/ShareIcon'
import ChevronRightCircleIcon from '@/icons/misc/ChevronRightCircleIcon'
import { useReferrerQuery } from '../utils'
import { useAppStore } from '@/store'
import WarningIcon from '@/icons/misc/WarningIcon'
import { MintInfo } from '../type'

export const TokenCreationSuccess = ({ token }: { token: MintInfo }) => {
  const toast = useToast()
  const publicKey = useAppStore((s) => s.publicKey)
  const referrerQuery = useReferrerQuery('&')

  // TODO: CopyButton link href

  return (
    <Box mx="auto">
      <Text textAlign="center" fontSize="xl" fontWeight="medium" mb={10} color={colors.lightPurple}>
        Congratulations!
      </Text>
      <Image
        src="https://ipfs.io/ipfs/QmYEojAzhW8oqVcCGvfuboJYvKnS1WoUvZNvNiVsmzzWiB"
        alt="Congratulations"
        mx="auto"
        mb={6}
        width="226px"
        height="128px"
      />
      <Text textAlign="center" color={colors.lightPurple} mb={3}>
        You’ve successfully created a token!
      </Text>
      <Flex
        px={5}
        py={3}
        gap={3}
        mb={10}
        borderRadius="12px"
        justifySelf="center"
        justifyContent="space-between"
        maxWidth="250px"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          borderRadius: '8px',
          padding: '1px',
          background: 'linear-gradient(245.22deg,rgb(239, 107, 46) 7.97%,rgb(255, 251, 43) 49.17%, rgb(239, 107, 46) 92.1%)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          pointerEvents: 'none'
        }}
      >
        <Flex alignItems="center" gap={2}>
          <Avatar
            src="https://ipfs.io/ipfs/QmYEojAzhW8oqVcCGvfuboJYvKnS1WoUvZNvNiVsmzzWiB"
            name={'tokenData.name'}
            size="sm"
            width="40px"
            height="40px"
          />
          <Box color={colors.lightPurple}>
            <Flex gap={1}>
              <Text fontWeight="medium" fontSize="lg">
                $ticker
              </Text>
              <Text fontWeight="medium" fontSize="lg" opacity={0.6}>
                (name)
              </Text>
            </Flex>
            <Text fontSize="sm" opacity={0.5}>
              address
            </Text>
          </Box>
        </Flex>
        <CopyButton
          buttonType="icon"
          Icon={ShareIcon}
          value="Token page link"
          onCopy={() => {
            toast({
              title: 'Token page link copied!',
              status: 'success',
              duration: 3000,
              isClosable: true,
              position: 'bottom'
            })
          }}
        />
      </Flex>
      <Flex direction="column" maxWidth="442px">
        <Text color={colors.lightPurple} mb={4}>
          Now, what’s next?
        </Text>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          background="#ABC4FF1F"
          px={5}
          py={3}
          borderRadius="12px"
          border="1px solid #ffdebf33"
          mb={4}
        >
          <Box>
            <Flex fontWeight="medium" gap={1} alignItems="center">
              <WarningIcon />
              <Text>Configure vesting wallet address</Text>
            </Flex>
            <Text fontSize="sm" color="#C4D6FF80">
              You must set an address to receive vesting tokens. Modify this any time on your created tokens page.
            </Text>
          </Box>
          <Link
            as={NextLink}
            href={`/profile?wallet=${publicKey ? publicKey.toBase58() : ''}${referrerQuery.replace('?', '&')}`}
            display="contents"
            shallow
            color={colors.lightPurple}
          >
            <Box>
              <ChevronRightCircleIcon />
            </Box>
          </Link>
        </Flex>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          background="#ABC4FF1F"
          px={5}
          py={3}
          borderRadius="12px"
          border="1px solid #ffdebf33"
        >
          <Box>
            <Text fontWeight="medium">View token</Text>
            <Text fontSize="sm" color="#C4D6FF80">
              Go to the token page to see progress, view details, trade, comment and more!
            </Text>
          </Box>
          <Link
            as={NextLink}
            href={`/token?mint=${token.mint}${referrerQuery}`}
            display="contents"
            shallow
            color={colors.lightPurple}
          >
            <Box>
              <ChevronRightCircleIcon />
            </Box>
          </Link>
        </Flex>
      </Flex>
    </Box>
  )
}
