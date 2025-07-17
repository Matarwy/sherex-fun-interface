import dynamic from 'next/dynamic'

const Swap = dynamic(() => import('@/views/Swap'))

function SwapPage() {
  return <Swap />
}

export default SwapPage

export async function getStaticProps() {
  return {
    props: { title: 'Swap' }
  }
}
