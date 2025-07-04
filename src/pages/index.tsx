import dynamic from 'next/dynamic'
const Launchpad = dynamic(() => import('@/views/Launchpad'))

function LaunchpadPage() {
  return <Launchpad />
}

export default LaunchpadPage

export async function getStaticProps() {
  return {
    props: { title: '' }
  }
}
