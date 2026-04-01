import React from 'react'
import { Sparkles } from 'lucide-react'

const RecommendationPanel = () => {
    return (
        <div className="flex flex-col h-full min-h-[150px] justify-center text-center items-center opacity-80 py-8"> 
            <Sparkles className="text-accent mb-3 animate-pulse" size={32} />
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Recommendation Engine</h3>
            <p className="text-[var(--text-secondary)] text-sm max-w-md">Once sufficient metrics are validated, your autonomous intelligence recommendations regarding study vectors will automatically instantiate here.</p>
        </div>
    )
}

export default RecommendationPanel 