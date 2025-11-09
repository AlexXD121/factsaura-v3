import { useState } from 'react'
import { motion } from 'framer-motion'

function Submit() {
  const [content, setContent] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResult({
        confidence: 0.78,
        isMisinformation: Math.random() > 0.5,
        explanation: "Analysis based on source credibility, fact-checking databases, and linguistic patterns.",
        sources: ["WHO.int", "Reuters.com", "FactCheck.org"]
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-card p-6 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Submit Content for Analysis</h1>
        <p className="text-white/70">Submit suspicious content for AI-powered fact-checking</p>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-medium mb-2">
              Content to Analyze
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the content you want to fact-check here..."
              className="glass-input w-full h-32 resize-none"
              disabled={isAnalyzing}
            />
          </div>

          <motion.button
            type="submit"
            disabled={!content.trim() || isAnalyzing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`glass-button w-full py-4 text-lg font-semibold ${
              isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              'Analyze Content'
            )}
          </motion.button>
        </form>

        {/* Analysis Results */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 glass-card"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Analysis Results</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Confidence Score:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${analysisResult.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-medium">
                    {(analysisResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80">Classification:</span>
                <span className={`px-3 py-1 rounded-full font-medium ${
                  analysisResult.isMisinformation 
                    ? 'bg-red-500/20 text-red-300' 
                    : 'bg-green-500/20 text-green-300'
                }`}>
                  {analysisResult.isMisinformation ? '⚠️ Likely Misinformation' : '✅ Appears Credible'}
                </span>
              </div>

              <div>
                <span className="text-white/80 block mb-2">AI Explanation:</span>
                <p className="text-white bg-white/5 p-3 rounded-lg">
                  {analysisResult.explanation}
                </p>
              </div>

              <div>
                <span className="text-white/80 block mb-2">Sources Checked:</span>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.sources.map((source, index) => (
                    <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button className="glass-button">Post to Community</button>
              <button className="glass-button">Ask AI Questions</button>
              <button className="glass-button">Share Results</button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Submit