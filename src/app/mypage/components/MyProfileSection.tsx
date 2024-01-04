import { ArrowRight } from '@/components/common/icons'
import { QueryMe } from '@/graphql/auth'
import { QueryCategories } from '@/graphql/category'
import { getClient } from '@/lib/client'
import { User } from '@/types/user'
import Link from 'next/link'

const MyProfileSection = async () => {
  const { data } = await getClient().query<User>({ query: QueryMe })
  console.log('data', data)
  return (
    <div className="px-5">
      <div className="py-8 border-b-2 border-gray-600">
        <Link href={'/'}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">{data?.nickname}</h2>
              <span className="text-xs text-gray-400">{data?.email}</span>
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
