import { Alert, Description, Filter, Headset } from '@/components/common/icons'
import Link from 'next/link'
import { createElement } from 'react'

const mypageMenuListMap = [
  {
    icon: Filter,
    title: '관심 카테고리',
    url: '/',
  },
  // {
  //   icon: Alert,
  //   title: '알림 설정',
  // },
  {
    icon: Description,
    title: '약관 및 정책',
    url: '/',
  },
  {
    icon: Headset,
    title: '고객센터',
    url: '/',
  },
] as const

const MenuList = () => {
  return (
    <div className="px-5">
      <div className="py-4 border-b border-gray-300">
        <ul>
          {mypageMenuListMap.map((menu, i) => (
            <li key={i}>
              <Link href={menu.url}>
                <div className="py-3 flex gap-3 items-center">
                  {createElement(menu.icon)}
                  <span className="text-gray-900">{menu.title}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default MenuList
