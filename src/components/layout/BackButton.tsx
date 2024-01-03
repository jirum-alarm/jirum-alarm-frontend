'use client'
import React from 'react'
import { ArrowLeft } from '../common/icons'
import useGoBack from '@/hooks/useGoBack'

const BackButton = () => {
  const goBack = useGoBack()

  return (
    <button className="p-2" onClick={goBack}>
      <ArrowLeft />
    </button>
  )
}

export default BackButton
