'use client'

import dynamic from 'next/dynamic'
import Header from '@/components/Header'

const HomeForm = dynamic(() => import('@/components/HomeForm'), { ssr: false })

export default function Home() {
  return (
    <div className="container">
      <Header />
      <HomeForm />
    </div>
  )
}