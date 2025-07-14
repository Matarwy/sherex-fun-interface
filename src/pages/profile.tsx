import dynamic from 'next/dynamic'
const Profile = dynamic(() => import('@/views/Launchpad/Profile'))

function ProfilePage() {
  return <Profile />
}

export default ProfilePage

export async function getStaticProps() {
  return {
    props: { title: 'Profile' }
  }
}
