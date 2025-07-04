import dynamic from 'next/dynamic'
const TokenDetail = dynamic(() => import('@/views/Launchpad/TokenDetail'))

function CoinDetailPage() {
  return <TokenDetail />
}

export default CoinDetailPage
