export const analysisMock = {
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
    management_strategy: 'Monitor comments for constructive discussion, avoid defensive responses',
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
};

export const videoAnalysisMock = {
  success: true,
  statusCode: 200,
  message: 'Content analysis successful',
  data: {
    delivery: {
      speaking_pace: {
        estimated_duration: '4:30-5:00 minutes',
        word_count: 267,
        optimal_wpm: 150,
        current_pace_rating: 0.85,
        pace_variance: {
          intro: 0.8,
          body: 0.9,
          conclusion: 0.7,
        },
        difficult_sections: [
          {
            text: "That's actually a Western misinterpretation",
            position: 85,
            suggested_pace: 120,
            reason: 'Complex terminology requires slower delivery',
          },
          {
            text: 'ikigai',
            position: 65,
            suggested_pace: 100,
            reason: 'Foreign word needs emphasis and clear pronunciation',
          },
        ],
      },
      readability_for_speech: {
        score: 0.92,
        sentence_complexity: 0.3,
        breath_points: 18,
        tongue_twisters: [
          {
            phrase: 'rushing through breakfast',
            position: 45,
            difficulty: 0.4,
            suggestion: "Practice the 'r' and 'th' combination",
          },
        ],
        transitions: {
          smooth_count: 8,
          awkward_count: 2,
          suggestions: [
            {
              position: 120,
              current: "But here's the thing",
              suggested: "However, here's what I discovered",
              reason: 'More natural flow for video content',
            },
          ],
        },
      },
      energy_flow: {
        overall_score: 0.88,
        energy_curve: [
          {
            timestamp: '0:00-0:15',
            energy: 0.9,
            note: 'Strong opening hook',
          },
          {
            timestamp: '0:15-1:30',
            energy: 0.7,
            note: 'Story setup phase',
          },
          {
            timestamp: '1:30-3:00',
            energy: 0.8,
            note: 'Educational content with personal examples',
          },
          {
            timestamp: '3:00-4:30',
            energy: 0.9,
            note: 'Strong call to action',
          },
        ],
        monotone_risk_sections: [
          {
            start: '1:15',
            end: '1:45',
            reason: 'Educational explanation about ikigai',
            suggestion: 'Add vocal variety when explaining the concept',
          },
        ],
      },
    },
    engagement: {
      hook_strength: {
        score: 0.85,
        first_15_seconds:
          'Strong relatable opening with personal struggle that many viewers will identify with',
        attention_grabbers: [
          {
            type: 'relatable_problem',
            text: 'hitting snooze five times, rushing through breakfast',
            effectiveness: 0.9,
          },
          {
            type: 'direct_address',
            text: 'Sound familiar?',
            effectiveness: 0.8,
          },
        ],
        improvement_suggestions: [
          'Consider adding a specific statistic about morning routine struggles',
          'Could include a teaser about the transformation results',
        ],
      },
      retention_prediction: {
        overall_score: 0.82,
        drop_off_risks: [
          {
            timestamp: '1:30',
            risk_level: 0.4,
            reason: 'Educational content about ikigai concept',
            suggestion: 'Add visual elements or personal anecdote',
          },
          {
            timestamp: '3:30',
            risk_level: 0.3,
            reason: 'Results section might feel too promotional',
            suggestion: 'Include specific metrics or examples',
          },
        ],
        engagement_boosters: [
          {
            timestamp: '0:30',
            element: 'Direct question engagement',
            boost_factor: 0.8,
          },
          {
            timestamp: '4:00',
            element: 'Challenge and call to action',
            boost_factor: 0.9,
          },
        ],
      },
      call_to_action: {
        presence: true,
        strength: 0.88,
        placement: 'end',
        clarity: 0.9,
        urgency: 0.7,
        suggestions: [
          'Add a specific deadline for the challenge',
          'Include a follow-up promise for viewers who participate',
        ],
      },
    },
    platform_optimization: {
      youtube: {
        score: 0.85,
        title_hook_strength: 0.8,
        description_optimization: 0.7,
        watch_time_prediction: '4-5 minutes',
        thumbnail_opportunities: [
          'Before/after morning routine visualization',
          'Japanese ikigai symbol with morning coffee',
          'Clock showing early morning time',
        ],
        seo_keywords: [
          'morning routine',
          'ikigai',
          'productivity',
          'self-improvement',
          'japanese philosophy',
          'gratitude practice',
        ],
        engagement_optimization: {
          subscribe_mention: false,
          comment_encouragement: true,
          like_reminder: false,
        },
      },
      tiktok: {
        score: 0.65,
        issues: [
          'Too long for typical TikTok attention span',
          'Educational content needs more visual elements',
          'Missing trending audio or music sync opportunities',
        ],
        adaptation_suggestions: [
          'Break into 3 separate videos: Problem, Solution, Results',
          'Add text overlays for key points',
          'Include trending morning routine hashtags',
        ],
        viral_potential: 0.7,
      },
      linkedin: {
        score: 0.78,
        professional_tone: 0.8,
        business_value: 0.75,
        thought_leadership: 0.8,
        networking_opportunities: [
          'Share productivity insights with professional network',
          'Connect with others interested in Japanese business philosophy',
          'Engage with wellness and productivity communities',
        ],
      },
      instagram_reels: {
        score: 0.72,
        visual_storytelling: 0.7,
        music_sync_opportunities: [
          'Calm morning music during gratitude section',
          'Upbeat music during transformation results',
          'Trending audio with morning routine hashtags',
        ],
        text_overlay_suggestions: [
          'Key ikigai definition',
          '10-minute challenge details',
          'Before/after comparison stats',
        ],
      },
    },
    structure: {
      narrative_flow: {
        score: 0.88,
        story_arc: 'problem-solution-transformation',
        pacing: 'well_balanced',
        logical_progression: 0.9,
        gaps: [
          {
            section: 'concept_explanation',
            issue: 'Could use more concrete examples of ikigai in practice',
            suggestion: 'Add 2-3 specific daily examples beyond coffee and breathing',
          },
        ],
      },
      content_density: {
        information_per_minute: 0.75,
        cognitive_load: 'medium',
        complexity_progression: 'simple_to_complex',
        digestibility: 0.85,
        suggestions: [
          'Break down ikigai concept into smaller chunks',
          'Add more transition phrases between concepts',
        ],
      },
      memorability: {
        score: 0.82,
        key_takeaways: 4,
        quotable_moments: [
          {
            text: "The real ikigai is much simpler. It's about finding small moments of meaning in your daily routine.",
            timestamp: '1:45',
            shareability: 0.9,
          },
          {
            text: "That's less time than you spend scrolling social media while drinking your coffee.",
            timestamp: '3:45',
            shareability: 0.8,
          },
        ],
        story_elements: 3,
        emotional_moments: 2,
      },
    },
    teleprompter_readiness: {
      overall_score: 0.88,
      difficulty_rating: 'intermediate',
      formatting_needs: {
        pause_markers: 12,
        emphasis_points: 8,
        speed_changes: 5,
        suggested_markup: [
          {
            position: 65,
            type: 'emphasis',
            reason: 'Foreign word pronunciation',
          },
          {
            position: 45,
            type: 'pause',
            duration: 1,
            reason: 'Question engagement moment',
          },
          {
            position: 180,
            type: 'speed_slow',
            factor: 0.8,
            reason: 'Key concept explanation',
          },
        ],
      },
      practice_recommendations: {
        estimated_rehearsals: 3,
        focus_areas: [
          'Japanese pronunciation of ikigai',
          'Natural delivery of personal story',
          'Energy maintenance during educational sections',
        ],
        common_stumble_points: [
          {
            phrase: 'Western misinterpretation',
            alternative: 'Western misunderstanding',
            position: 85,
          },
        ],
      },
    },
    ai_recommendations: [
      {
        type: 'hook_improvement',
        priority: 'medium',
        category: 'engagement',
        title: 'Strengthen Opening Hook',
        description:
          'Add specific statistic about morning routine struggles to increase relatability',
        implementation: "Start with '73% of people hit snooze at least once every morning'",
        expected_impact: '15-20% improvement in first 15-second retention',
        icon: '🎯',
      },
      {
        type: 'platform_adaptation',
        priority: 'high',
        category: 'optimization',
        title: 'TikTok Version Creation',
        description: 'Break content into digestible TikTok-sized segments',
        platforms: ['tiktok'],
        expected_impact: 'Expand reach to younger demographics',
        icon: '📱',
      },
      {
        type: 'engagement_boost',
        priority: 'high',
        category: 'retention',
        title: 'Add Visual Cues',
        description: 'Include timestamps and visual elements during educational sections',
        position: '1:30-2:30',
        expected_impact: 'Reduce drop-off risk by 25%',
        icon: '👁️',
      },
      {
        type: 'pacing_optimization',
        priority: 'medium',
        category: 'delivery',
        title: 'Emphasize Key Concepts',
        description: 'Slow down delivery during ikigai explanation for better comprehension',
        current: 'Normal pace throughout',
        suggested: '80% speed during concept explanation',
        expected_impact: 'Improved message retention',
        icon: '⏱️',
      },
    ],
    quality: {
      authenticity_score: 0.92,
      voice_consistency: 0.88,
      message_clarity: 0.85,
      emotional_resonance: 0.8,
      technical_quality: {
        grammar_score: 0.95,
        vocabulary_appropriateness: 0.9,
        tone_consistency: 0.88,
        filler_word_risk: 0.15,
        unclear_references: ['this Japanese concept'],
      },
    },
    predicted_performance: {
      completion_rate: 0.78,
      engagement_rate: 0.72,
      share_probability: 0.68,
      audience_segments: [
        {
          segment: 'productivity_enthusiasts',
          comprehension: 0.9,
          engagement: 0.85,
          retention: 0.8,
        },
        {
          segment: 'self_improvement_seekers',
          comprehension: 0.85,
          engagement: 0.9,
          retention: 0.82,
        },
        {
          segment: 'general_lifestyle',
          comprehension: 0.75,
          engagement: 0.7,
          retention: 0.65,
        },
      ],
    },
    analysis_metadata: {
      analyzed_at: '2025-08-02T16:18:08.070Z',
      processing_time: 2.4,
      ai_confidence: 0.88,
      script_length: 267,
      estimated_video_length: '4:30-5:00 minutes',
      analysis_version: '2.1.0',
      focus_area: 'comprehensive_video_optimization',
    },
    analysisId: 'V4VHMPA3M1',
  },
  timestamp: '2025-08-02T16:19:19.309Z',
};

export const dashboardMock = {
  nigeria: {
    trending_topics: [
      {
        topic: 'BBNaija',
        platforms: ['twitter', 'instagram', 'tiktok'],
        engagement_score: 0.9,
        trend_velocity: 'stable',
        demographics: ['18-24', '25-34'],
        content_types: ['video', 'image', 'text'],
        duration_prediction: 'weeks',
      },
      {
        topic: 'Laptop',
        platforms: ['twitter'],
        engagement_score: 0.7,
        trend_velocity: 'rising',
        demographics: ['25-34', '35-44'],
        content_types: ['text', 'image'],
        duration_prediction: 'days',
      },
      {
        topic: 'Yoruba Culture',
        platforms: ['twitter', 'instagram', 'tiktok'],
        engagement_score: 0.8,
        trend_velocity: 'stable',
        demographics: ['25-34', '35-44'],
        content_types: ['video', 'image', 'text'],
        duration_prediction: 'weeks',
      },
    ],
    hashtags: {
      twitter: [
        {
          tag: '#BBNaija',
          volume: 85000,
          engagement_rate: 0.85,
          related_topics: ['reality tv', 'entertainment', 'voting'],
        },
        {
          tag: '#Laptop',
          volume: 12000,
          engagement_rate: 0.6,
          related_topics: ['technology', 'work', 'students'],
        },
        {
          tag: '#Yoruba',
          volume: 8500,
          engagement_rate: 0.7,
          related_topics: ['culture', 'language', 'tradition'],
        },
      ],
      instagram: [
        {
          tag: '#nigeria',
          posts_count: 2500000,
          engagement_rate: 0.8,
          content_type: 'posts',
        },
        {
          tag: '#lagos',
          posts_count: 1800000,
          engagement_rate: 0.75,
          content_type: 'reels',
        },
        {
          tag: '#naija',
          posts_count: 1200000,
          engagement_rate: 0.7,
          content_type: 'stories',
        },
      ],
      tiktok: [
        {
          tag: '#nigeria',
          views: 15000000,
          trend_score: 0.85,
          music_associated: true,
        },
        {
          tag: '#naija',
          views: 12000000,
          trend_score: 0.8,
          music_associated: true,
        },
        {
          tag: '#afrobeats',
          views: 8500000,
          trend_score: 0.9,
          music_associated: true,
        },
      ],
      linkedin: [
        {
          tag: '#NigerianBusiness',
          professional_relevance: 0.9,
          industry: 'business',
          engagement_type: 'discussion',
        },
        {
          tag: '#LagosTech',
          professional_relevance: 0.85,
          industry: 'technology',
          engagement_type: 'networking',
        },
      ],
    },
    content_insights: {
      viral_formats: [
        {
          format: 'Afrobeats dance challenges',
          platforms: ['tiktok', 'instagram'],
          success_rate: 0.85,
          key_elements: ['trending music', 'dance moves', 'cultural pride'],
        },
        {
          format: 'Comedy skits',
          platforms: ['instagram', 'tiktok', 'twitter'],
          success_rate: 0.8,
          key_elements: ['local humor', 'relatable scenarios', 'short format'],
        },
      ],
      peak_posting_times: [
        {
          platform: 'instagram',
          time: '19:00',
          timezone: 'WAT',
          engagement_boost: 0.9,
        },
        {
          platform: 'twitter',
          time: '20:00',
          timezone: 'WAT',
          engagement_boost: 0.85,
        },
      ],
      content_gaps: [
        {
          topic: 'Nigerian fintech',
          opportunity_score: 0.8,
          suggested_angle: 'educational content about digital banking',
        },
      ],
    },
    platform_updates: [
      {
        platform: 'instagram',
        update_type: 'algorithm',
        impact_on_creators: 'positive',
        adaptation_strategy: 'focus on carousels and engagement',
      },
    ],
    creator_opportunities: [
      {
        niche: 'Afrobeats music content',
        demand_level: 0.9,
        competition_level: 0.6,
        monetization_potential: 0.8,
        recommended_platforms: ['tiktok', 'instagram', 'youtube'],
      },
    ],
    regional_specifics: {
      local_trends: [
        {
          trend: 'BBNaija discussions',
          cultural_context: 'Popular reality TV show',
          local_relevance: 0.95,
        },
      ],
      language_preferences: [
        {
          language: 'English',
          platform_preference: 'all',
          content_performance: 0.8,
        },
        {
          language: 'Pidgin English',
          platform_preference: 'tiktok',
          content_performance: 0.85,
        },
      ],
      time_zones: {
        peak_activity: '19:00-22:00',
        weekend_patterns: 'different',
        holiday_impact: 'increased engagement during festivals',
      },
    },
    analysis_metadata: {
      analyzed_at: '2025-08-02T12:00:00Z',
      data_sources: ['twitter trends', 'instagram insights', 'tiktok analytics'],
      confidence_level: 0.85,
      next_update_recommended: '2025-08-03T12:00:00Z',
      geographic_scope: 'Nigeria',
    },
  },
  uk: {
    trending_topics: [
      {
        topic: 'Yorkshire Day',
        platforms: ['twitter', 'instagram'],
        engagement_score: 0.8,
        trend_velocity: 'rising',
        demographics: ['25-34', '35-44'],
        content_types: ['image', 'text'],
        duration_prediction: 'days',
      },
      {
        topic: 'Tom Brady',
        platforms: ['twitter'],
        engagement_score: 0.7,
        trend_velocity: 'stable',
        demographics: ['18-24', '25-34'],
        content_types: ['text', 'video'],
        duration_prediction: 'hours',
      },
      {
        topic: 'England vs India Cricket',
        platforms: ['twitter', 'instagram'],
        engagement_score: 0.85,
        trend_velocity: 'rising',
        demographics: ['25-34', '35-44'],
        content_types: ['video', 'text', 'image'],
        duration_prediction: 'days',
      },
    ],
    hashtags: {
      twitter: [
        {
          tag: '#YorkshireDay',
          volume: 15000,
          engagement_rate: 0.75,
          related_topics: ['regional pride', 'culture', 'tradition'],
        },
        {
          tag: '#ENGvIND',
          volume: 45000,
          engagement_rate: 0.8,
          related_topics: ['cricket', 'sports', 'live match'],
        },
      ],
      instagram: [
        {
          tag: '#uk',
          posts_count: 8500000,
          engagement_rate: 0.7,
          content_type: 'posts',
        },
        {
          tag: '#london',
          posts_count: 12000000,
          engagement_rate: 0.75,
          content_type: 'reels',
        },
        {
          tag: '#england',
          posts_count: 6500000,
          engagement_rate: 0.72,
          content_type: 'stories',
        },
      ],
      tiktok: [
        {
          tag: '#uk',
          views: 25000000,
          trend_score: 0.8,
          music_associated: false,
        },
        {
          tag: '#britishhumour',
          views: 8500000,
          trend_score: 0.85,
          music_associated: false,
        },
      ],
      linkedin: [
        {
          tag: '#UKBusiness',
          professional_relevance: 0.9,
          industry: 'business',
          engagement_type: 'discussion',
        },
      ],
    },
    content_insights: {
      viral_formats: [
        {
          format: 'British humor commentary',
          platforms: ['tiktok', 'twitter'],
          success_rate: 0.8,
          key_elements: ['dry humor', 'cultural references', 'timing'],
        },
      ],
      peak_posting_times: [
        {
          platform: 'instagram',
          time: '19:00',
          timezone: 'GMT',
          engagement_boost: 0.85,
        },
        {
          platform: 'twitter',
          time: '20:00',
          timezone: 'GMT',
          engagement_boost: 0.8,
        },
      ],
      content_gaps: [
        {
          topic: 'UK sustainability trends',
          opportunity_score: 0.75,
          suggested_angle: 'practical eco-friendly tips',
        },
      ],
    },
    platform_updates: [
      {
        platform: 'instagram',
        update_type: 'feature',
        impact_on_creators: 'positive',
        adaptation_strategy: 'leverage new commerce features',
      },
    ],
    creator_opportunities: [
      {
        niche: 'British lifestyle content',
        demand_level: 0.8,
        competition_level: 0.7,
        monetization_potential: 0.75,
        recommended_platforms: ['instagram', 'tiktok', 'youtube'],
      },
    ],
    regional_specifics: {
      local_trends: [
        {
          trend: 'Regional celebrations',
          cultural_context: 'Yorkshire Day celebrations',
          local_relevance: 0.8,
        },
      ],
      language_preferences: [
        {
          language: 'English',
          platform_preference: 'all',
          content_performance: 0.9,
        },
      ],
      time_zones: {
        peak_activity: '19:00-22:00',
        weekend_patterns: 'similar',
        holiday_impact: 'moderate increase during bank holidays',
      },
    },
    analysis_metadata: {
      analyzed_at: '2025-08-02T12:00:00Z',
      data_sources: ['twitter trends', 'instagram insights', 'tiktok analytics'],
      confidence_level: 0.8,
      next_update_recommended: '2025-08-03T12:00:00Z',
      geographic_scope: 'United Kingdom',
    },
  },
  us: {
    trending_topics: [
      {
        topic: 'Happy August',
        platforms: ['twitter', 'instagram'],
        engagement_score: 0.7,
        trend_velocity: 'rising',
        demographics: ['18-24', '25-34'],
        content_types: ['image', 'text'],
        duration_prediction: 'days',
      },
      {
        topic: 'SmackDown',
        platforms: ['twitter'],
        engagement_score: 0.85,
        trend_velocity: 'rising',
        demographics: ['18-24', '25-34'],
        content_types: ['video', 'text'],
        duration_prediction: 'hours',
      },
      {
        topic: 'KCON',
        platforms: ['twitter', 'instagram', 'tiktok'],
        engagement_score: 0.9,
        trend_velocity: 'rising',
        demographics: ['18-24'],
        content_types: ['video', 'image'],
        duration_prediction: 'days',
      },
    ],
    hashtags: {
      twitter: [
        {
          tag: '#HappyAugust',
          volume: 25000,
          engagement_rate: 0.6,
          related_topics: ['new month', 'goals', 'motivation'],
        },
        {
          tag: '#SmackDown',
          volume: 75000,
          engagement_rate: 0.85,
          related_topics: ['WWE', 'wrestling', 'entertainment'],
        },
        {
          tag: '#KCON',
          volume: 95000,
          engagement_rate: 0.9,
          related_topics: ['K-pop', 'concert', 'music'],
        },
      ],
      instagram: [
        {
          tag: '#trending',
          posts_count: 45000000,
          engagement_rate: 0.7,
          content_type: 'reels',
        },
        {
          tag: '#viral',
          posts_count: 38000000,
          engagement_rate: 0.75,
          content_type: 'posts',
        },
        {
          tag: '#love',
          posts_count: 120000000,
          engagement_rate: 0.6,
          content_type: 'stories',
        },
      ],
      tiktok: [
        {
          tag: '#fyp',
          views: 500000000,
          trend_score: 0.9,
          music_associated: false,
        },
        {
          tag: '#trending',
          views: 250000000,
          trend_score: 0.85,
          music_associated: false,
        },
      ],
      linkedin: [
        {
          tag: '#USBusiness',
          professional_relevance: 0.85,
          industry: 'business',
          engagement_type: 'networking',
        },
      ],
    },
    content_insights: {
      viral_formats: [
        {
          format: 'Short-form video content',
          platforms: ['tiktok', 'instagram', 'youtube'],
          success_rate: 0.9,
          key_elements: ['quick hooks', 'trending audio', 'authentic content'],
        },
        {
          format: 'Carousel posts',
          platforms: ['instagram', 'linkedin'],
          success_rate: 0.85,
          key_elements: ['educational content', 'visual storytelling', 'swipe-worthy design'],
        },
      ],
      peak_posting_times: [
        {
          platform: 'instagram',
          time: '15:00',
          timezone: 'EST',
          engagement_boost: 0.9,
        },
        {
          platform: 'tiktok',
          time: '16:00',
          timezone: 'EST',
          engagement_boost: 0.85,
        },
        {
          platform: 'linkedin',
          time: '10:00',
          timezone: 'EST',
          engagement_boost: 0.8,
        },
      ],
      content_gaps: [
        {
          topic: 'AI tools for creators',
          opportunity_score: 0.9,
          suggested_angle: 'practical tutorials and tips',
        },
      ],
    },
    platform_updates: [
      {
        platform: 'tiktok',
        update_type: 'algorithm',
        impact_on_creators: 'neutral',
        adaptation_strategy: 'focus on longer engagement times',
      },
      {
        platform: 'instagram',
        update_type: 'feature',
        impact_on_creators: 'positive',
        adaptation_strategy: 'utilize new shopping features',
      },
    ],
    creator_opportunities: [
      {
        niche: 'Tech and AI content',
        demand_level: 0.95,
        competition_level: 0.8,
        monetization_potential: 0.9,
        recommended_platforms: ['youtube', 'linkedin', 'tiktok'],
      },
      {
        niche: 'Entertainment commentary',
        demand_level: 0.85,
        competition_level: 0.75,
        monetization_potential: 0.8,
        recommended_platforms: ['tiktok', 'twitter', 'youtube'],
      },
    ],
    regional_specifics: {
      local_trends: [
        {
          trend: 'Wrestling entertainment',
          cultural_context: 'WWE SmackDown popularity',
          local_relevance: 0.8,
        },
        {
          trend: 'K-pop culture',
          cultural_context: 'KCON events and fandom',
          local_relevance: 0.85,
        },
      ],
      language_preferences: [
        {
          language: 'English',
          platform_preference: 'all',
          content_performance: 0.9,
        },
        {
          language: 'Spanish',
          platform_preference: 'tiktok',
          content_performance: 0.75,
        },
      ],
      time_zones: {
        peak_activity: '15:00-21:00',
        weekend_patterns: 'different',
        holiday_impact: 'significant increase during major holidays',
      },
    },
    analysis_metadata: {
      analyzed_at: '2025-08-02T12:00:00Z',
      data_sources: ['twitter trends', 'instagram insights', 'tiktok analytics', 'youtube data'],
      confidence_level: 0.9,
      next_update_recommended: '2025-08-03T12:00:00Z',
      geographic_scope: 'United States',
    },
  },
};
