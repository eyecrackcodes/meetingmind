import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Key, AlertCircle, Brain, Lightbulb, Users, BarChart } from 'lucide-react'

interface ApiKeyManagerProps {
  onSaveApiKey: (apiKey: string) => void
}

export function ApiKeyManager({ onSaveApiKey }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState('')

  const handleSave = () => {
    if (apiKey.trim()) {
      onSaveApiKey(apiKey.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Brain className="h-5 w-5" />
          AI Subject Matter Expert & Coach Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              AI Coaching Features (Requires OpenAI API Key)
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-700">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Brain className="h-3 w-3 mt-1 flex-shrink-0" />
                  <span><strong>Template Generation:</strong> Create custom templates from simple prompts</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="h-3 w-3 mt-1 flex-shrink-0" />
                  <span><strong>Content Coaching:</strong> Real-time guidance on critical thinking coverage</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <BarChart className="h-3 w-3 mt-1 flex-shrink-0" />
                  <span><strong>Meeting Analysis:</strong> AI review of completeness and effectiveness</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-3 w-3 mt-1 flex-shrink-0" />
                  <span><strong>Industry Expertise:</strong> Final expense insurance specific recommendations</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-blue-700">
              <strong>Add your OpenAI API key to unlock AI-powered coaching and template generation:</strong>
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSave} disabled={!apiKey.trim()}>
                Activate AI Coach
              </Button>
            </div>
            <div className="flex items-start gap-2 text-xs text-blue-600">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Your API key is stored locally in your browser and never sent to our servers. 
                Get your API key from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline hover:text-blue-800"
                >
                  platform.openai.com/api-keys
                </a>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 