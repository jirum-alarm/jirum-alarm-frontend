'use client'
import { QueryProducts } from '@/graphql'
import { QueryCategories } from '@/graphql/category'
import { IProductOutput } from '@/graphql/interface'
import { ICategoryOutput } from '@/graphql/interface/category'
import { useSuspenseQuery } from '@apollo/client'
import React, { KeyboardEvent, useCallback, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useRouter, useSearchParams } from 'next/navigation'
import CategoryTab from './categoryTab/CategoryTab'
import { TopButton } from '@/components/TopButton'
import dynamic from 'next/dynamic'
const ProductCard = dynamic(() => import('./productCard/ProductCard'), { ssr: false })
const ProductList = () => {
  const router = useRouter()
  const limit = 20
  const allCategory = { id: 0, name: '전체' }
  const [inputData, setInputData] = useState<string>('')
  const [keyword, setKeyword] = useState<string>('')
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState(0)
  const [hasNextData, setHasNextData] = useState(true)
  const searchParams = useSearchParams()

  const { data: categoriesData } = useSuspenseQuery<ICategoryOutput>(QueryCategories)
  const {
    data: products,
    refetch,
    fetchMore,
  } = useSuspenseQuery<IProductOutput>(QueryProducts, {
    variables: { limit },
  })
  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextData) {
        loadFunc()
      }
    },
  })

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

  const loadFunc = () => {
    const searchAfter = products.products[products.products.length - 1]?.searchAfter
    // 데이터가 있을 떄만 fetchMore 해준다.
    if (!products) return
    fetchMore({
      variables: {
        searchAfter,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!prev.products) {
          return {
            products: [],
          }
        }
        if (fetchMoreResult.products.length === 0) {
          return {
            products: [...prev.products],
          }
        }
        if (fetchMoreResult.products.length < limit) {
          setHasNextData(false)
        }
        return {
          products: [...prev.products, ...fetchMoreResult.products],
        }
      },
    })
  }

  const handleClose = useCallback(() => {
    setKeyword(() => '')
    setInputData(() => '')
  }, [])

  const isMobileDevice = () => {
    const userAgent = window.navigator.userAgent
    const isMobileDevice = Boolean(
      userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i),
    )
    return isMobileDevice
  }
  useEffect(() => {
    setIsMobile(isMobileDevice)
    const categoryParam = searchParams.get('category')
    const keywordParam = searchParams.get('keyword')
    if (categoriesData) setActiveTab(Number(categoryParam))
    else setActiveTab(0)
    if (keywordParam) {
      setKeyword(keywordParam)
      setInputData(keywordParam)
    } else {
      setKeyword('')
    }
  }, [])

  useEffect(() => {
    if (products && products.products.length % limit !== 0) {
      setHasNextData(false)
    }
  }, [products])
  useEffect(() => {
    setHasNextData(true)
    const params: {
      keyword?: string
      categoryId?: number
      limit: number
      searchAfter?: undefined
    } = {
      limit,
    }
    if (keyword) {
      params.keyword = keyword
    }
    if (!keyword) {
      params.keyword = undefined
    }
    if (activeTab) {
      params.categoryId = activeTab
    }
    if (!activeTab) {
      params.categoryId = undefined
    }
    params.searchAfter = undefined
    refetch({ ...params })
    if (!keyword && !activeTab) router.replace('/')
    else if (!keyword && activeTab) router.replace(`?category=${activeTab}`)
    else if (keyword && !activeTab) router.replace(`?keyword=${keyword}`)
    else router.replace(`?keyword=${keyword}&category=${activeTab}`)
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
      <CategoryTab
        tabData={[allCategory, ...categoriesData.categories]}
        activeTab={activeTab}
        setTab={setActiveTab}
      />

      <div className="flex mt-11">
        {products.products.length === 0 ? (
          <p>게시글이 없습니다.</p>
        ) : (
          <div className="item-center grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
            {products.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <TopButton />
      {hasNextData && <div ref={ref} className="h-48 w-full" />}
    </main>
  )
}

export default ProductList
