import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  PlusCircle, 
  FileText, 
  FolderOpen, 
  Download, 
  FileDown,
  BookOpen,
  Users,
  TrendingUp,
  BarChart,
  Settings,
  Bot,
  Sparkles
} from 'lucide-react'
import { MeetingTemplate } from '@/types'
import { downloadFile, formatDate } from '@/lib/utils'
import { finalExpenseTemplates } from '@/lib/sampleData'

interface ControlPanelProps {
  hasTemplate: boolean
  onCreateNew: () => void
  onCreateAI: () => void
  onLoadTemplate: (template: MeetingTemplate) => void
  onImportTemplate: (template: MeetingTemplate) => void
  currentTemplate: MeetingTemplate | null
  hasApiKey: boolean
}

export function ControlPanel({ 
  hasTemplate, 
  onCreateNew,
  onCreateAI, 
  onLoadTemplate, 
  onImportTemplate,
  currentTemplate,
  hasApiKey 
}: ControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const template = JSON.parse(e.target?.result as string)
          onImportTemplate(template)
        } catch (error) {
          alert('Error reading template file. Please ensure it\'s a valid JSON file.')
        }
      }
      reader.readAsText(file)
    }
    // Reset the input
    event.target.value = ''
  }

  const handleExportTemplate = () => {
    if (currentTemplate) {
      const data = JSON.stringify(currentTemplate, null, 2)
      downloadFile(data, `meeting-template-${formatDate(new Date())}.json`, 'application/json')
    }
  }

  const handleExportNotes = () => {
    if (currentTemplate) {
      let notesContent = `${currentTemplate.meetingTitle}\n`
      notesContent += `Date: ${new Date(currentTemplate.meetingDate).toLocaleDateString()}\n`
      notesContent += `Facilitator: ${currentTemplate.facilitator}\n`
      notesContent += `Core Question: ${currentTemplate.coreQuestion}\n\n`
      notesContent += `Context: ${currentTemplate.meetingContext}\n\n`
      
      currentTemplate.sections.forEach((section, index) => {
        notesContent += `${index + 1}. ${section.title}\n`
        if (section.criticalThinkingNotes) {
          notesContent += `   Critical Thinking: ${section.criticalThinkingNotes}\n`
        }
        section.checklistItems.forEach((item, itemIndex) => {
          const status = item.completed ? '✓' : '☐'
          notesContent += `   ${status} ${item.title}\n`
          notesContent += `     ${item.description}\n`
        })
        notesContent += '\n'
      })
      
      downloadFile(notesContent, `meeting-notes-${formatDate(new Date())}.txt`, 'text/plain')
    }
  }

  const handleLoadTemplate = (templateType: keyof typeof finalExpenseTemplates) => {
    const template = finalExpenseTemplates[templateType]()
    onLoadTemplate(template)
  }

  return (
    <Card className="mb-6 no-print">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              onClick={onCreateNew} 
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Create New Template
            </Button>
            {hasApiKey && (
              <Button 
                onClick={onCreateAI} 
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Bot className="h-4 w-4" />
                <Sparkles className="h-3 w-3" />
                AI Generate Template
              </Button>
            )}
            <Button 
              onClick={handleImportClick} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Import Template
            </Button>
            <Button 
              onClick={handleExportTemplate} 
              variant="outline" 
              disabled={!hasTemplate} 
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Template
            </Button>
            <Button 
              onClick={handleExportNotes} 
              variant="outline" 
              disabled={!hasTemplate} 
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export Notes
            </Button>
          </div>

          {/* Final Expense Meeting Templates */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 text-center mb-3">
              Final Expense Call Center Templates
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                onClick={() => handleLoadTemplate('product')}
                variant="secondary" 
                size="sm"
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Product Training
              </Button>
              <Button 
                onClick={() => handleLoadTemplate('coaching')}
                variant="secondary" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Agent Coaching
              </Button>
              <Button 
                onClick={() => handleLoadTemplate('manager')}
                variant="secondary" 
                size="sm"
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Manager Best Practices
              </Button>
              <Button 
                onClick={() => handleLoadTemplate('metrics')}
                variant="secondary" 
                size="sm"
                className="flex items-center gap-2"
              >
                <BarChart className="h-4 w-4" />
                Metrics & KPIs
              </Button>
              <Button 
                onClick={() => handleLoadTemplate('salesOps')}
                variant="secondary" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Sales Operations
              </Button>
            </div>
          </div>
        </div>
        
        <input 
          ref={fileInputRef} 
          type="file" 
          accept=".json" 
          onChange={handleFileChange} 
          className="hidden" 
        />
      </CardContent>
    </Card>
  )
} 