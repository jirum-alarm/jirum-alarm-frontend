'use client'
import { QueryProducts } from '@/graphql'
import { QueryCategories } from '@/graphql/category'
import { IProductOutput } from '@/graphql/interface'
import { ICategoryOutput } from '@/graphql/interface/category'
import { useSuspenseQuery } from '@apollo/client'
import React, { KeyboardEvent, useCallback, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useRouter, useSearchParams } from 'next/navigation'
import { TopButton } from '@/components/TopButton'
import dynamic from 'next/dynamic'
import { IProductsFilterParam } from '@/type/main'
import SwipeableViews from 'react-swipeable-views'
import { useDevice } from '@/hook/useDevice'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import '../../../style/React_tabs.css'

const ProductCard = dynamic(() => import('./ProductCard'), { ssr: false })
const ProductList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const limit = 20
  const allCategory = { id: 0, name: '전체' }
  const [inputData, setInputData] = useState<string>('')
  const [keyword, setKeyword] = useState<string>('')
  const [activeTab, setActiveTab] = useState(0)
  const [hasNextData, setHasNextData] = useState(true)
  const { isMobile } = useDevice()

  const { data: categoriesData } = useSuspenseQuery<ICategoryOutput>(QueryCategories)
  const {
    data: { products },
    refetch,
    fetchMore,
  } = useSuspenseQuery<IProductOutput>(QueryProducts, {
    variables: { limit },
  })

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextData) {
        fetchMoreProducts()
      }
    },
  })

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index)
  }, [])
  const keywordHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputData(event.target.value)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      searchHandler()
    }
  }

  const searchHandler = () => {
    if (!inputData) {
      return
    }
    setKeyword(inputData)
  }
  const handleClose = useCallback(() => {
    setKeyword(() => '')
    setInputData(() => '')
  }, [])

  const fetchMoreProducts = () => {
    const searchAfter = products.at(-1)?.searchAfter
    if (!products) {
      return
    }
    fetchMore({
      variables: {
        searchAfter,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!prev.products) {
          return { products: [] }
        } else if (fetchMoreResult.products.length === 0) {
          return { products: [...prev.products] }
        } else if (fetchMoreResult.products.length < limit) {
          setHasNextData(false)
        }
        return { products: [...prev.products, ...fetchMoreResult.products] }
      },
    })
  }

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const keywordParam = searchParams.get('keyword')
    if (categoriesData) {
      setActiveTab(Number(categoryParam))
    } else {
      setActiveTab(0)
    }
    if (keywordParam) {
      setKeyword(keywordParam)
      setInputData(keywordParam)
    } else {
      setKeyword('')
    }
  }, [])

  useEffect(() => {
    if (products && products.length % limit !== 0) {
      setHasNextData(false)
    }
  }, [products])

  useEffect(() => {
    setHasNextData(true)

    const params: IProductsFilterParam = {
      limit,
      keyword: keyword || undefined,
      categoryId: activeTab || undefined,
      searchAfter: undefined,
    }

    refetch(params)

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== undefined && key !== 'limit'),
    )
    const queryString = new URLSearchParams(filteredParams).toString()

    const route = queryString ? `?${queryString}` : '/'
    router.replace(route)
  }, [keyword, activeTab])

  return (
    <main>
      <div className="mb-6 drop-shadow-md">
        <div className="mt-6 relative flex items-center w-full h-14 rounded-lg shadow hover:shadow-md bg-white overflow-hidden">
          <div className="grid place-items-center h-full w-14 text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
            onKeyDown={onKeyDown}
            onChange={keywordHandler}
            value={inputData}
            spellCheck={false}
            placeholder="키워드 검색"
          />

          <div
            className="grid place-items-center h-full w-14 text-gray-300 cursor-pointer"
            onClick={handleClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
      </div>
      <Tabs
        className="react-tabs__tab-list"
        forceRenderTabPanel
        selectedIndex={activeTab}
        onSelect={handleTabChange}
        defaultFocus
        disableUpDownKeys
      >
        <TabList
          className={`will-change-transform scroll-smooth overflow-x-scroll ${
            isMobile ? 'whitespace-nowrap' : ''
          }`}
        >
          {[allCategory, ...categoriesData.categories].map((category) => (
            <Tab
              key={category.id}
              className="hover:text-zinc-700 transition duration-200 inline-block p-2 text-zinc-400 font-bold b-0"
              id={`profile-tab-${category.id}`}
              data-tabs-target={`#profile-${category.id}`}
              type="button"
              role="tab"
              aria-controls={`profile-${category.id}`}
            >
              <button>{category.name}</button>
            </Tab>
          ))}
        </TabList>

        <div className="flex">
          {products.length === 0 ? (
            <p>게시글이 없습니다.</p>
          ) : (
            <SwipeableViews
              index={activeTab}
              onChangeIndex={handleTabChange}
              animateTransitions={isMobile}
              className="will-change-transform my-6"
            >
              {[allCategory, ...categoriesData.categories].map((category) => (
                <TabPanel key={category.id}>
                  <div className="flex">
                    <div className="item-center grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                </TabPanel>
              ))}
            </SwipeableViews>
          )}
        </div>
        <TopButton />
        {hasNextData && <div ref={ref} className="h-48 w-full" />}
      </Tabs>
    </main>
  )
}

export default ProductList
