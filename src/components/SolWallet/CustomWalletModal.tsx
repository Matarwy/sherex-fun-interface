import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletIcon } from "@solana/wallet-adapter-react-ui";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Button,
  HStack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";

declare global {
  interface Window {
    phantom?: any;
    solflare?: any;
  }
}

interface CustomWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

let AUTOCONNECT_ATTEMPTED = false;




const CustomWalletModal: React.FC<CustomWalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { wallets, select } = useWallet();
  console.log("🚀 ~ wallets:", wallets)
  console.log("CustomWalletModal isOpen:", isOpen)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const iconSize = useBreakpointValue({ base: 24, md: 28 }) || 24

  useEffect(() => {
    if (typeof window == "undefined" || !window.location) return;

    const url = new URL(window.location.href);
    if (!url.searchParams.has("connectWallet")) return;

    const connectWallet = url.searchParams.get("connectWallet");
    for (let wallet of wallets)
      if (wallet.adapter.name === connectWallet) {
        if (AUTOCONNECT_ATTEMPTED) break;
        AUTOCONNECT_ATTEMPTED = true;
        select(wallet.adapter.name);
        url.searchParams.delete("connectWallet");
        window.history.pushState(null, "", url.toString());
        break;
      }
  }, [
    typeof window == "undefined" ? undefined : window.location.search,
    wallets,
  ]);

  const hasWindowSolana =
    typeof window != "undefined" &&
    (typeof window.solana != "undefined" ||
      typeof window.phantom != "undefined" ||
      typeof window.solflare != "undefined");

  useEffect(() => {
    console.log(hasWindowSolana)
  }, [hasWindowSolana])

  const size = useBreakpointValue({ base: "full", md: "md" })
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={size} motionPreset="slideInBottom">
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent bg="#272727" borderRadius={{ base: "2xl", md: "xl" }} pb={{ base: 6, md: 6 }}>
        <ModalHeader color="white">Wallet connect</ModalHeader>
        <ModalCloseButton color="#292929" bg="#2FD3BA" _hover={{ bg: "#29CBB2" }} borderRadius="full" />
        <ModalBody>
          <VStack spacing={3} align="stretch">
            {mounted && wallets.map((wallet) => (
              <Button
                key={wallet.adapter.name}
                onClick={() => {
                  let deepLinkBase: string | null = null
                  if (!hasWindowSolana) {
                    if (wallet.adapter.name == "Phantom") deepLinkBase = "https://phantom.app"
                  }
                  if (deepLinkBase) {
                    const currentUrl = new URL(window.location.href)
                    currentUrl.searchParams.append("connectWallet", wallet.adapter.name)
                    const deepLink = new URL("/ul/browse/" + encodeURIComponent(currentUrl.toString()), deepLinkBase)
                    deepLink.searchParams.append("ref", window.location.origin)
                    window.open(deepLink.toString(), '_blank', 'noopener,noreferrer')
                  } else select(wallet.adapter.name)
                  onClose()
                }}
                variant="outline"
                justifyContent="flex-start"
                borderColor="#272727"
                bg="#272727"
                _hover={{ bg: "#4A4A4A", borderColor: "#2FD3BA" }}
                borderRadius="full"
                py={3}
                px={4}
              >
                <HStack spacing={3} align="center">
                  <WalletIcon wallet={wallet} style={{ width: iconSize, height: iconSize }} />
                  <Text fontWeight="bold" fontSize="18px" lineHeight="5">
                    {wallet.adapter.name}
                  </Text>
                </HStack>
              </Button>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CustomWalletModal;


