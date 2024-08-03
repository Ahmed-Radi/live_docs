import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='auth-page'>
      <SignUp />
    </div>
  )
}