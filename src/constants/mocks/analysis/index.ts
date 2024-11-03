export const analysisMock = {
  success: true,
  statusCode: 200,
  message: 'Content analysis successful',
  data: {
    sentiment: {
      score: -0.75,
      label: 'negative',
      confidence: 0.92,
      emotions: [
        {
          type: 'anger',
          intensity: 0.85,
        },
        {
          type: 'sadness',
          intensity: 0.65,
        },
        {
          type: 'trust',
          intensity: 0.15,
        },
        {
          type: 'fear',
          intensity: 0.25,
        },
        {
          type: 'joy',
          intensity: 0.05,
        },
        {
          type: 'excitement',
          intensity: 0.05,
        },
        {
          type: 'anticipation',
          intensity: 0.35,
        },
        {
          type: 'surprise',
          intensity: 0.1,
        },
      ],
    },
    virality: {
      score: 0.78,
      factors: [
        {
          factor: 'emotional_hook',
          impact: 'high',
          reasoning: 'Strong negative emotions about universal workplace frustration',
        },
        {
          factor: 'shareability',
          impact: 'high',
          reasoning: 'Highly relatable workplace experience many will want to share',
        },
        {
          factor: 'trending_topic',
          impact: 'medium',
          reasoning: 'Meeting culture criticism is ongoing workplace trend',
        },
        {
          factor: 'call_to_action',
          impact: 'low',
          reasoning: 'No explicit call to action present',
        },
        {
          factor: 'visual_appeal',
          impact: 'low',
          reasoning: 'Only one emoji, minimal visual elements',
        },
        {
          factor: 'timing_relevance',
          impact: 'medium',
          reasoning: 'Always relevant during business hours',
        },
      ],
      predicted_engagement: {
        likes: {
          min: 150,
          max: 500,
        },
        shares: {
          min: 25,
          max: 100,
        },
        comments: {
          min: 30,
          max: 80,
        },
      },
    },
    brand: {
      voice_consistency: 0.35,
      tone: 'casual',
      formality_level: 0.2,
      brand_alignment: {
        score: 0.25,
        deviations: [
          'Negative workplace attitude',
          'Unprofessional language',
          'Complaining tone',
          'Cynical perspective',
        ],
      },
    },
    quality: {
      readability_score: 0.85,
      grammar_score: 0.75,
      clarity_score: 0.9,
      spelling_errors: [],
      grammar_issues: [
        {
          issue: 'Missing apostrophe in contraction',
          correction: "could've should be could've",
          position: 62,
        },
        {
          issue: 'Lowercase sentence start',
          correction: 'why should be Why',
          position: 171,
        },
      ],
    },
    platform_analysis: {
      character_efficiency: 0.82,
      hashtag_optimization: {
        current_hashtags: ['#MeetingHell', '#WasteOfTime', '#OverIt'],
        suggested_hashtags: [
          '#WorkplaceFrustration',
          '#ProductivityTips',
          '#MeetingCulture',
          '#WorkLifeBalance',
        ],
        hashtag_strategy: 'mixed',
      },
      optimal_length: {
        current: 280,
        recommended: 200,
        reasoning: 'Could be more concise while maintaining impact',
      },
      formatting_suggestions: [
        {
          type: 'line_breaks',
          suggestion: 'Break into shorter paragraphs for better readability',
        },
        {
          type: 'emojis',
          suggestion: 'Add more relevant emojis to increase engagement',
        },
      ],
    },
    audience: {
      target_demographic: {
        age_group: '25-44',
        interests: ['workplace culture', 'productivity', 'career development'],
        professional_level: 'mid',
      },
      accessibility_score: 0.85,
      inclusivity_check: {
        score: 0.9,
        flags: [],
      },
    },
    timing: {
      optimal_post_times: [
        {
          time: '9:00 AM',
          day: 'Monday',
          reasoning: 'Peak meeting frustration time',
          engagement_boost: 1.3,
        },
        {
          time: '1:00 PM',
          day: 'Wednesday',
          reasoning: 'Mid-week workplace stress peak',
          engagement_boost: 1.2,
        },
        {
          time: '4:00 PM',
          day: 'Friday',
          reasoning: 'End of week exhaustion',
          engagement_boost: 1.4,
        },
      ],
      seasonality_relevance: 0.7,
      trending_alignment: [
        {
          trend: 'workplace wellness',
          relevance: 0.75,
        },
        {
          trend: 'meeting culture criticism',
          relevance: 0.9,
        },
      ],
    },
    risk: {
      overall_risk: 'medium',
      factors: [
        {
          type: 'brand_mismatch',
          severity: 'medium',
          description: 'Negative tone may not align with professional brand',
          mitigation: 'Reframe as constructive feedback',
        },
        {
          type: 'controversial_topic',
          severity: 'low',
          description: 'Workplace criticism could be divisive',
          mitigation: 'Add solution-oriented perspective',
        },
      ],
      compliance_check: {
        gdpr_compliant: true,
        accessibility_compliant: true,
        industry_guidelines: true,
      },
    },
    recommendations: [
      {
        type: 'improvement',
        priority: 'high',
        category: 'content',
        title: 'Add constructive element',
        description: 'Balance complaint with solution or positive outlook',
        implementation: 'End with suggestion for improvement',
        expected_impact: 'Increased professional credibility',
        icon: '💡',
      },
      {
        type: 'optimization',
        priority: 'medium',
        category: 'engagement',
        title: 'Include call-to-action',
        description: 'Ask audience about their meeting experiences',
        implementation: 'Add question at end',
        expected_impact: 'Higher comment engagement',
        icon: '💬',
      },
      {
        type: 'improvement',
        priority: 'medium',
        category: 'formatting',
        title: 'Improve visual appeal',
        description: 'Add more emojis and line breaks',
        implementation: 'Break into 2-3 shorter paragraphs with relevant emojis',
        expected_impact: 'Better readability and engagement',
        icon: '✨',
      },
    ],
    competitive: {
      uniqueness_score: 0.45,
      similar_content_detected: true,
      differentiation_opportunities: [
        'Add specific meeting improvement tips',
        'Share personal productivity hacks',
        'Create meeting efficiency framework',
      ],
      market_gap_analysis:
        'Opportunity to pivot from complaint to solution-focused content about meeting optimization',
    },
    authenticity: {
      score: 0.92,
      factors: [
        {
          factor: 'genuine_voice',
          impact: 'positive',
          reasoning: 'Natural, unfiltered expression of frustration',
        },
        {
          factor: 'personal_experience',
          impact: 'positive',
          reasoning: 'Clearly based on real workplace experience',
        },
        {
          factor: 'emotional_authenticity',
          impact: 'positive',
          reasoning: 'Raw, honest emotional expression',
        },
        {
          factor: 'manufactured_feel',
          impact: 'negative',
          reasoning: 'No signs of artificial or scripted content',
        },
      ],
    },
    controversy_potential: {
      score: 0.35,
      triggers: ['workplace criticism', 'productivity complaints'],
      debate_likelihood: 'medium',
      management_strategy:
        'Monitor comments for constructive discussion, avoid defensive responses',
    },
    conversion_potential: {
      score: 0.25,
      intent_signals: [
        {
          signal: 'cta_presence',
          strength: 0.1,
        },
        {
          signal: 'value_proposition',
          strength: 0.2,
        },
        {
          signal: 'urgency_markers',
          strength: 0.4,
        },
        {
          signal: 'social_proof',
          strength: 0.3,
        },
      ],
      optimization_suggestions: [
        'Add link to productivity resources',
        'Include meeting efficiency tips',
        'Offer free meeting template',
      ],
    },
    context_intelligence: {
      style_intention_score: 0.85,
      cultural_relevance: 0.9,
      industry_alignment: 0.65,
    },
    analysis_metadata: {
      analyzed_at: '2025-08-02T15:03:11.284Z',
      processing_time: 1.2,
      ai_confidence: 0.88,
      content_length: 280,
      platform: 'general',
      analysis_version: '2.1.0',
    },
  },
  timestamp: '2025-08-02T15:03:40.930Z',
};
