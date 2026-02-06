'use client'

import { useDashboardStore } from '@/lib/store/dashboard'
import { useSubmitRender } from '@/lib/api/hooks'

export function RenderButton() {
  const { 
    generatedDialogue, 
    selectedAvatar, 
    selectedBackground,
    setRenderJobId,
    setRenderStatus,
    setActiveScreen
  } = useDashboardStore()
  
  const submitRender = useSubmitRender()

  const handleSubmit = async () => {
    if (!generatedDialogue) {
      alert('Please generate dialogue first')
      return
    }

    if (!selectedAvatar) {
      alert('Please select an avatar')
      return
    }

    try {
      setRenderStatus('queued')
      
      const result = await submitRender.mutateAsync({
        audio_file_path: '/temp/audio.wav', // TODO: Get from voice generation
        dialogue_text: generatedDialogue,
        emotional_tone: 'joyful', // TODO: Get from emotion slider
        duration_seconds: 10,
        approved_by: 'dashboard-user'
      })

      setRenderJobId(result.job_id)
      setRenderStatus('rendering')
      
      // Switch to DEPLOY screen to watch progress
      setActiveScreen('deploy')
      
    } catch (error) {
      console.error('Render submission failed:', error)
      setRenderStatus('error')
      alert('Failed to submit render job')
    }
  }

  const isReady = generatedDialogue && selectedAvatar && selectedBackground

  return (
    <button
      onClick={handleSubmit}
      disabled={!isReady || submitRender.isPending}
      className="w-full py-4 bg-primary text-accent font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {submitRender.isPending ? 'Submitting...' : 'Submit to Render Queue'}
    </button>
  )
}

