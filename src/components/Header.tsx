import React from 'react'
import { Brain } from 'lucide-react'

export function Header() {
  return (
    <div className="text-center mb-8 p-6 rounded-lg text-white header-gradient">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Brain className="h-8 w-8" />
        <h1 className="text-3xl md:text-4xl font-bold">Critical Thinking Meeting Organizer</h1>
      </div>
      <p className="text-lg opacity-90">
        Structure your meetings with Richard Paul & Linda Elder's critical thinking framework
      </p>
    </div>
  )
} 