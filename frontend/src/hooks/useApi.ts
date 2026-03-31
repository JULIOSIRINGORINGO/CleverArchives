import useSWR from 'swr'

const fetcher = (url: string) => {
  const fullUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}${url}`
  return fetch(fullUrl, {
    headers: { 
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      'Accept': 'application/json'
    }
  }).then(res => {
    if (!res.ok) throw new Error('Network response was not ok')
    return res.json()
  })
}

export function useApi(endpoint: string | null) {
  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // cache 30 detik
  })

  return {
    data,
    isLoading,
    isError: error,
    mutate
  }
}
