'use client'

import dynamic from 'next/dynamic'
import Header from '@/components/Header'

const HomeForm = dynamic(() => import('@/components/HomeForm'), { ssr: false })

export default function Home() {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 32px' }}>
      <Header />
      <HomeForm />
    </div>
  )
}
