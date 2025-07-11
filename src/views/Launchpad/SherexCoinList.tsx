import React, { RefObject, useImperativeHandle, useRef, useState } from 'react'
import TokenListCard from './components/TokenListCard'
import SherexTokenListCard from './components/SherexTokenListCard'
import useSherexMintList, { MintSortField } from '@/hooks/launchpad/useSherexMintList'
import useMintInfo from '@/hooks/launchpad/useMintInfo'
import { getMintWatchList } from './utils'
import { MintInfo, SherexMintInfo } from './type'

export interface SearchProps {
  isSearch: boolean
  isLoading: boolean
  data: SherexMintInfo[]
  hasMore: boolean
  onLoadMore: () => void
}

export interface CoinListActionRef {
  onSearchChange: (props: SearchProps) => void
  refresh: () => void
}

interface Props {
  sort?: MintSortField
  meta: string
  platformId?: string
  showAnimations?: boolean
  includeNsfw?: boolean
  actionRef?: RefObject<CoinListActionRef>
}

export const SherexCoinList = ({ sort, meta, platformId, showAnimations, includeNsfw, actionRef }: Props) => {
  const [searchResult, setSearchResult] = useState<{
    isSearch: boolean
    isLoading: boolean
    data: SherexMintInfo[]
    hasMore: boolean
    onLoadMore: () => void
  }>({ isSearch: false, isLoading: false, data: [], hasMore: false, onLoadMore: () => {} })
  const timeRef = useRef(Date.now())

  const isWatchList = meta === 'watch_list'
  const { data, isLoading, loadMore, hasMore, mutate } = useSherexMintList({
    sort,
    notRefresh: !showAnimations,
    includeNsfw,
    platformId,
    mintType: isWatchList ? 'default' : (meta as 'heating' | 'graduated'),
    timeTag: timeRef.current
  })

  const { data: watchMintData, isLoading: isWatchLoading } = useMintInfo({
    mints: isWatchList ? Array.from(getMintWatchList()).reverse() : []
  })

  useImperativeHandle(
    actionRef,
    () => ({
      refresh: () => {
        mutate()
      },
      onSearchChange: ({ isSearch, isLoading, data, hasMore, onLoadMore }) => {
        setSearchResult({
          isSearch,
          isLoading,
          data,
          hasMore,
          onLoadMore
        })
      }
    }),
    [mutate]
  )

  return (
    <>
      {/* <TokenListCard
        tokens={searchResult.isSearch ? searchResult.data : isWatchList ? watchMintData : data}
        isLoading={searchResult.isSearch ? searchResult.isLoading : isWatchList ? isWatchLoading : isLoading}
        hasMore={isWatchList ? false : hasMore}
        onLoadMore={loadMore}
      /> */}
      {searchResult.isSearch ? <SherexTokenListCard
        tokens={searchResult.data}
        isLoading={searchResult.isLoading}
        hasMore={isWatchList ? false : hasMore}
        onLoadMore={loadMore}
      /> : isWatchList ? <TokenListCard
        tokens={watchMintData}
        isLoading={isWatchLoading}
        hasMore={false}
        onLoadMore={loadMore}
      /> : <SherexTokenListCard
        tokens={data}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />}
    </>
  )
}
