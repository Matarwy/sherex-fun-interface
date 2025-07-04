/**
 * for v2's experience, we need to use a function to generate the route path, so we can do some tricks when routing
 */
import { MayFunction, TokenInfo } from '@raydium-io/raydium-sdk-v2'
import router, { useRouter } from 'next/router'

import { ParsedUrlQuery } from 'querystring'
import { shrinkToValue } from './shrinkToValue'
import { shakeObjectUndefinedItems } from './objectTools'
import { isClient } from '@/utils/common'

export type PageRouteConfigs = {
  '(home)': {
    // eslint-disable-next-line @typescript-eslint/ban-types
    queryProps?: MayFunction<{}, []>
  }
}

const pageRoutePathnames: Record<keyof PageRouteConfigs, string> = {
  '(home)': '/',
}

export type PageRouteName = keyof PageRouteConfigs

/**
 * main method of navigating
 * @param page the target page label in {@link PageRouteConfigs}
 * @param opts route configs
 * @returns
 */
export function routeToPage<ToPage extends keyof PageRouteConfigs>(page: ToPage, opts?: PageRouteConfigs[ToPage]) {
  if (!pageRoutePathnames[page]) {
    throw new Error(`page ${page} is not defined in routeToPage`)
  }
  return router.push({
    pathname: pageRoutePathnames[page],
    query: shrinkToValue(opts?.queryProps, [{ currentPageQuery: router.query }]) as any
  })
}

export function setUrlQuery<T extends ParsedUrlQuery>(additionalQuery: Partial<T>) {
  router.replace({ query: shakeObjectUndefinedItems({ ...router.query, ...additionalQuery }) }, undefined, { shallow: true })
}

export const routeBack = () => {
  router.back()
}

export function useRouteQuery<Query extends Record<string, any>>(): Query {
  const router = useRouter()
  const query = router.query as Query
  if (!Object.keys(query).length && isClient()) {
    const searchParams = new URLSearchParams(location.search)
    return Array.from(searchParams.entries()).reduce(
      (acc, cur) => ({
        ...acc,
        [cur[0]]: cur[1]
      }),
      {}
    ) as Query
  }
  return query
}

export function useRoutePageName(): keyof PageRouteConfigs | undefined {
  const router = useRouter()
  const pathname = router.pathname
  const [pageName] = Object.entries(pageRoutePathnames).find(([, path]) => path === pathname) ?? []
  return pageName as keyof PageRouteConfigs | undefined
}
