import { useState, useEffect } from 'react'
import { MeetingTemplate } from '@/types'
import { Header } from '@/components/Header'
import { FrameworkPanel } from '@/components/FrameworkPanel'
import { ControlPanel } from '@/components/ControlPanel'
import { ApiKeyManager } from '@/components/ApiKeyManager'
import { TemplateEditor } from '@/components/TemplateEditor'
import { TemplateGenerator } from '@/components/TemplateGenerator'
import { ProgressTracker } from '@/components/ProgressTracker'
import { InteractiveChecklist } from '@/components/InteractiveChecklist'
import { AICoachingPanel } from '@/components/AICoachingPanel'
// import { getSampleTemplate } from '@/lib/sampleData'

function App() {
  const [currentTemplate, setCurrentTemplate] = useState<MeetingTemplate | null>(null)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [showTemplateGenerator, setShowTemplateGenerator] = useState(false)
  const [apiKey, setApiKey] = useState<string>('')
  const [progress, setProgress] = useState({ totalItems: 0, completedItems: 0, percentage: 0 })

  useEffect(() => {
    // Load API key from environment or localStorage
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY
    const localApiKey = localStorage.getItem('openai_api_key')
    
    if (envApiKey) {
      setApiKey(envApiKey)
    } else if (localApiKey) {
      setApiKey(localApiKey)
    }
  }, [])

  const handleSaveApiKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem('openai_api_key', key)
  }

  const handleLoadTemplate = (template: MeetingTemplate) => {
    setCurrentTemplate(template)
    setShowTemplateEditor(false)
  }

  const handleTemplateGenerated = (template: MeetingTemplate) => {
    setCurrentTemplate(template)
    setShowTemplateEditor(false)
    setShowTemplateGenerator(false)
  }

  const handleImportTemplate = (template: MeetingTemplate) => {
    setCurrentTemplate(template)
    setShowTemplateEditor(false)
    setShowTemplateGenerator(false)
  }

  const handleProgressUpdate = (newProgress: { totalItems: number; completedItems: number; percentage: number }) => {
    setProgress(newProgress)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        
        {!apiKey && (
          <ApiKeyManager 
            onSaveApiKey={handleSaveApiKey}
          />
        )}

        <FrameworkPanel />

                <ControlPanel 
          hasTemplate={!!currentTemplate}
          onCreateNew={() => setShowTemplateEditor(true)}
          onCreateAI={() => setShowTemplateGenerator(true)}
          onLoadTemplate={handleLoadTemplate}
          onImportTemplate={handleImportTemplate}
          currentTemplate={currentTemplate}
          hasApiKey={!!apiKey}
        />

        {showTemplateEditor && (
          <TemplateEditor
            apiKey={apiKey}
            onClose={() => setShowTemplateEditor(false)}
            onGenerate={handleTemplateGenerated}
          />
        )}

        {showTemplateGenerator && apiKey && (
          <TemplateGenerator
            apiKey={apiKey}
            onClose={() => setShowTemplateGenerator(false)}
            onGenerate={handleTemplateGenerated}
          />
        )}

        {currentTemplate && (
          <>
            <ProgressTracker progress={progress} />
            {apiKey && (
              <AICoachingPanel
                apiKey={apiKey}
                template={currentTemplate}
                completedItems={progress.completedItems}
                totalItems={progress.totalItems}
              />
            )}
            <InteractiveChecklist
              template={currentTemplate}
              onProgressUpdate={handleProgressUpdate}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default App 