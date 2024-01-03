import { ArrowRight } from '@/components/common/icons'
import Link from 'next/link'

const MyProfileSection = () => {
  return (
    <div className="px-5">
      <div className="py-8 border-b-2 border-gray-600">
        <Link href={'/'}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">사용자닉네임</h2>
              <span className="text-xs text-gray-400">useremail@email.com</span>
            </div>
            <div>
              <ArrowRight />
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default MyProfileSection
