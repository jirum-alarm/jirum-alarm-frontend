import { nanoid } from 'nanoid'
import React from 'react'

interface ICategoryTab {
  tabData: { id: number; name: string }[]
  activeTab: number
  setTab: React.Dispatch<React.SetStateAction<number>>
}
const CategoryTab = ({ tabData, activeTab, setTab }: ICategoryTab) => {
  const handleTabChange = (index: number) => {
    setTab(index)
  }
  return (
    <div className={`flex overflow-x-scroll scrollbar-hide`}>
      {tabData.map((item: any) => {
        return (
          <div
            key={nanoid()}
            className={
              'min-w-fit flex items-center justify-center p-2 hover:cursor-pointer font-bold hover:font-extrabold' +
              (activeTab == item.id
                ? ' font-extrabold text-fontblue border-b-2 border-blue-300'
                : ' text-gray-500')
            }
            onClick={() => handleTabChange(Number(item.id))}
          >
            {item.name}
          </div>
        )
      })}
    </div>
  )
}

export default CategoryTab
