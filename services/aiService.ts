import { Platform } from 'react-native';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  completion: string;
  success: boolean;
  error?: string;
}

interface Risk {
  title: string;
  description: string;
  level: 'High' | 'Medium' | 'Low';
  color: string;
  category: string;
}

interface ImageAnalysisResponse {
  analysis: string;
  risks: Risk[];
  success: boolean;
  error?: string;
}

class AIService {
  private openAIKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1';
  private fallbackURL = 'https://toolkit.rork.com/text/llm/';

  constructor() {
    // Try to get OpenAI key from environment or AsyncStorage
    this.initializeAPIKey();
  }

  private async initializeAPIKey() {
    try {
      // Check if running in Expo environment with access to process.env
      if (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) {
        this.openAIKey = process.env.OPENAI_API_KEY;
        console.log('✅ OpenAI API key loaded from environment');
        return;
      }

      // For mobile/web, try AsyncStorage
      if (Platform.OS !== 'web') {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const storedKey = await AsyncStorage.getItem('openai_api_key');
        if (storedKey) {
          this.openAIKey = storedKey;
          console.log('✅ OpenAI API key loaded from AsyncStorage');
        }
      } else {
        // For web, try localStorage
        const storedKey = localStorage.getItem('openai_api_key');
        if (storedKey) {
          this.openAIKey = storedKey;
          console.log('✅ OpenAI API key loaded from localStorage');
        }
      }
    } catch {
      console.log('ℹ️ No OpenAI API key found, will use fallback service');
    }
  }

  async setAPIKey(key: string): Promise<void> {
    this.openAIKey = key;
    
    try {
      if (Platform.OS !== 'web') {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('openai_api_key', key);
      } else {
        localStorage.setItem('openai_api_key', key);
      }
      console.log('✅ OpenAI API key saved successfully');
    } catch (error) {
      console.error('❌ Failed to save OpenAI API key:', error);
    }
  }

  async removeAPIKey(): Promise<void> {
    this.openAIKey = null;
    
    try {
      if (Platform.OS !== 'web') {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('openai_api_key');
      } else {
        localStorage.removeItem('openai_api_key');
      }
      console.log('✅ OpenAI API key removed successfully');
    } catch (error) {
      console.error('❌ Failed to remove OpenAI API key:', error);
    }
  }

  private async callOpenAI(messages: AIMessage[]): Promise<AIResponse> {
    if (!this.openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using the latest efficient model
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return {
        completion: data.choices[0]?.message?.content || 'No response generated',
        success: true,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  private async callFallbackAPI(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const response = await fetch(this.fallbackURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`Fallback API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        completion: data.completion,
        success: true,
      };
    } catch (error) {
      console.error('Fallback API Error:', error);
      throw error;
    }
  }

  async generateCompletion(messages: AIMessage[]): Promise<AIResponse> {
    try {
      // Try OpenAI first if key is available
      if (this.openAIKey) {
        console.log('🤖 Using OpenAI API for completion');
        return await this.callOpenAI(messages);
      } else {
        console.log('🔄 Using fallback API for completion');
        return await this.callFallbackAPI(messages);
      }
    } catch (error) {
      // If OpenAI fails, try fallback
      if (this.openAIKey) {
        console.log('⚠️ OpenAI failed, trying fallback API');
        try {
          return await this.callFallbackAPI(messages);
        } catch {
          return {
            completion: 'Sorry, I\'m currently unable to process your request. Please try again later.',
            success: false,
            error: 'Both OpenAI and fallback services are unavailable',
          };
        }
      }
      
      return {
        completion: 'Sorry, I\'m currently unable to process your request. Please try again later.',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async analyzeFinancialDocument(documentName: string, documentContent?: string): Promise<ImageAnalysisResponse> {
    const systemPrompt = `You are an expert financial auditor AI assistant. Analyze financial documents and identify:
1. Potential risks and red flags
2. Compliance issues
3. Unusual patterns or anomalies
4. Recommendations for further investigation

Provide your analysis in a structured format with specific, actionable insights.`;

    const userPrompt = documentContent 
      ? `Please analyze this financial document content:\n\nDocument: ${documentName}\n\nContent: ${documentContent}\n\nProvide detailed analysis focusing on audit risks, compliance issues, and recommendations.`
      : `Please analyze this financial document: ${documentName}. Based on the document name and type, provide insights on potential audit areas to focus on, common risks associated with this type of document, and recommended audit procedures.`;

    try {
      const response = await this.generateCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      if (!response.success) {
        return {
          analysis: response.completion,
          risks: [],
          success: false,
          error: response.error,
        };
      }

      // Parse the response to extract structured risks
      const risks = this.extractRisksFromAnalysis(response.completion);

      return {
        analysis: response.completion,
        risks,
        success: true,
      };
    } catch (error) {
      return {
        analysis: 'Failed to analyze document. Please try again.',
        risks: [],
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  private extractRisksFromAnalysis(analysis: string): Risk[] {
    const risks: Risk[] = [];
    const riskKeywords = {
      high: ['critical', 'severe', 'major', 'significant', 'urgent', 'fraud', 'material misstatement'],
      medium: ['moderate', 'notable', 'concerning', 'attention', 'review', 'investigate'],
      low: ['minor', 'low', 'minimal', 'routine', 'standard']
    };

    // Simple risk extraction based on keywords and patterns
    const sentences = analysis.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    sentences.forEach((sentence, index) => {
      const lowerSentence = sentence.toLowerCase();
      
      // Determine risk level based on keywords
      let level: 'High' | 'Medium' | 'Low' = 'Medium';
      let color = '#F59E0B';
      
      if (riskKeywords.high.some(keyword => lowerSentence.includes(keyword))) {
        level = 'High';
        color = '#EF4444';
      } else if (riskKeywords.low.some(keyword => lowerSentence.includes(keyword))) {
        level = 'Low';
        color = '#3B82F6';
      }

      // Extract category based on common audit areas
      let category = 'General';
      if (lowerSentence.includes('revenue')) category = 'Revenue Recognition';
      else if (lowerSentence.includes('inventory')) category = 'Asset Valuation';
      else if (lowerSentence.includes('compliance') || lowerSentence.includes('regulation')) category = 'Compliance';
      else if (lowerSentence.includes('cash') || lowerSentence.includes('liquidity')) category = 'Cash Flow';
      else if (lowerSentence.includes('debt') || lowerSentence.includes('liability')) category = 'Liabilities';
      else if (lowerSentence.includes('related party')) category = 'Related Parties';

      if (index < 3 && sentence.trim().length > 30) { // Only take first few meaningful sentences
        risks.push({
          title: `AI-Detected ${level} Risk`,
          description: sentence.trim().substring(0, 120) + (sentence.length > 120 ? '...' : ''),
          level,
          color,
          category,
        });
      }
    });

    return risks.slice(0, 3); // Limit to 3 risks
  }

  hasAPIKey(): boolean {
    return !!this.openAIKey;
  }

  getAPIStatus(): { hasKey: boolean; provider: string } {
    return {
      hasKey: !!this.openAIKey,
      provider: this.openAIKey ? 'OpenAI' : 'Fallback Service'
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;