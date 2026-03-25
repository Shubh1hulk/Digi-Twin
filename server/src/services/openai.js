let openaiClient = null;

if (process.env.OPENAI_API_KEY) {
  try {
    const { OpenAI } = require('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('✅ OpenAI client initialized');
  } catch (e) {
    console.log('⚡ OpenAI init failed, using mock responses');
  }
}

const mockSimulationScenarios = (decision) => {
  const lower = decision.toLowerCase();

  if (lower.includes('job') || lower.includes('career') || lower.includes('startup') || lower.includes('quit')) {
    return [
      {
        title: 'Leap of Faith – Go All In',
        shortTerm: 'Immediate income disruption, but laser focus on your venture. Expect 6-12 months of tight finances.',
        longTerm: 'High risk, high reward. Potential for 5-10x income growth and deep personal fulfillment within 3 years.',
        risks: ['Financial runway limited to 12 months', 'Market validation still needed', 'High emotional stress'],
        opportunities: ['Full creative control', 'Equity ownership', 'Faster execution speed'],
        score: 74
      },
      {
        title: 'Parallel Path – Side Hustle First',
        shortTerm: 'Keep current job, build MVP on evenings/weekends. Lower risk with slower initial traction.',
        longTerm: 'Validate market fit before full commitment. Transition when monthly revenue hits 50% of salary.',
        risks: ['Burnout from dual commitment', 'Slower growth velocity', 'Divided creative attention'],
        opportunities: ['Financial safety net maintained', 'Real market testing', 'Zero-pressure environment'],
        score: 88
      },
      {
        title: 'Strategic Pivot – Industry Immersion First',
        shortTerm: 'Join a relevant startup or company to gain insider knowledge and build your network.',
        longTerm: 'Launch an informed, well-networked venture in 18 months with domain expertise.',
        risks: ['Delayed launch window', 'Risk of comfort trap', 'Competitors may move first'],
        opportunities: ['Deep domain expertise', 'Warm industry connections', 'Funded education'],
        score: 65
      }
    ];
  }

  if (lower.includes('move') || lower.includes('relocat') || lower.includes('city') || lower.includes('country')) {
    return [
      {
        title: 'Bold Move – Relocate Immediately',
        shortTerm: 'Accept the disruption. New city, new social circle built from scratch. Higher initial costs.',
        longTerm: 'New environment unlocks career opportunities, fresh perspectives, and personal growth.',
        risks: ['Social isolation in early months', 'Higher cost of living', 'Culture adjustment curve'],
        opportunities: ['Fresh start energy', 'Career advancement', 'Expanded lifestyle options'],
        score: 71
      },
      {
        title: 'Test Drive – Extended Stay',
        shortTerm: 'Spend 2-3 months in the new location before committing. Use remote work if available.',
        longTerm: 'Make an informed, confident decision. Reduces regret probability significantly.',
        risks: ['Limbo feeling affects relationships', 'Delayed career moves', 'Added short-term costs'],
        opportunities: ['Fully informed decision', 'Early network building', 'Reduced long-term risk'],
        score: 85
      },
      {
        title: 'Stay & Optimize – Build Remotely',
        shortTerm: 'Leverage remote work to access opportunities from current location.',
        longTerm: 'Build financial cushion and then choose move on your terms, not pressure.',
        risks: ['May miss timing-sensitive opportunities', 'Network disadvantage', 'Slower career momentum'],
        opportunities: ['Financial stability', 'Relationship preservation', 'Strategic timing control'],
        score: 60
      }
    ];
  }

  if (lower.includes('invest') || lower.includes('money') || lower.includes('financ') || lower.includes('stock') || lower.includes('crypto')) {
    return [
      {
        title: 'Aggressive Growth – High Risk Portfolio',
        shortTerm: 'Allocate 60%+ to high-growth assets. High volatility expected in year 1.',
        longTerm: 'Potential for 3-5x returns over 5-7 years if market conditions align.',
        risks: ['High volatility and drawdown risk', 'Emotional decision-making under pressure', 'Timing market is extremely difficult'],
        opportunities: ['Outsized returns potential', 'Compounding at high growth rate', 'Early retirement possibility'],
        score: 62
      },
      {
        title: 'Balanced Diversification',
        shortTerm: 'Spread across index funds, bonds, and some growth assets. Steady 8-12% annual return.',
        longTerm: 'Reliable wealth building with manageable risk. Hits most retirement goals.',
        risks: ['Slower wealth accumulation vs aggressive', 'Inflation can erode bond returns', 'Requires patience'],
        opportunities: ['Consistent compounding', 'Low stress management', 'Proven long-term strategy'],
        score: 86
      },
      {
        title: 'Conservative Safety – Capital Preservation',
        shortTerm: 'Focus on cash, bonds, and dividend stocks. Safety first, growth second.',
        longTerm: 'Preserves capital but may struggle to beat inflation long-term.',
        risks: ['Below-inflation returns possible', 'Missed growth opportunities', 'Purchasing power erosion'],
        opportunities: ['Capital preservation', 'Predictable income', 'Low stress and volatility'],
        score: 55
      }
    ];
  }

  if (lower.includes('relationship') || lower.includes('marry') || lower.includes('partner') || lower.includes('dating')) {
    return [
      {
        title: 'Commit Fully – Invest in the Relationship',
        shortTerm: 'Prioritize the relationship. Invest time, energy, and emotional availability.',
        longTerm: 'Deep partnership built on intentional effort creates lasting bond.',
        risks: ['Vulnerability to heartbreak', 'Personal goals may need adjustment', 'Dependency risk'],
        opportunities: ['Deep connection and fulfillment', 'Stable foundation for other goals', 'Shared growth'],
        score: 78
      },
      {
        title: 'Gradual Build – Slow Burn',
        shortTerm: 'Take it step by step. No rushing, allow the relationship to develop organically.',
        longTerm: 'Decisions made under lower pressure lead to more authentic long-term compatibility.',
        risks: ['Partner may want more commitment faster', 'Uncertainty can cause anxiety', 'May miss window'],
        opportunities: ['True compatibility test', 'Personal freedom maintained', 'Informed decision'],
        score: 72
      }
    ];
  }

  // Generic fallback
  return [
    {
      title: 'Bold Action – Take the Leap',
      shortTerm: 'Immediate change brings short-term disruption but clears the path for growth and momentum.',
      longTerm: 'High risk, high reward scenario. 60% probability of significantly better outcomes in 2-3 years.',
      risks: ['Uncertainty and ambiguity', 'Resource strain in transition', 'Adaptation challenges'],
      opportunities: ['Transformative personal growth', 'New possibilities unlock', 'Momentum and energy boost'],
      score: 68
    },
    {
      title: 'Calculated Step – Plan & Execute',
      shortTerm: 'Structured approach with clear 90-day milestones reduces risk while maintaining momentum.',
      longTerm: 'Steady, sustainable progress towards goal with higher probability of long-term success.',
      risks: ['May miss timing windows', 'Over-planning paralysis risk', 'Slower visible progress'],
      opportunities: ['Risk mitigation and control', 'Resource optimization', 'Better stakeholder alignment'],
      score: 82
    },
    {
      title: 'Optimize Status Quo – Build Before Moving',
      shortTerm: 'Maximize current situation and build a stronger foundation before making any major move.',
      longTerm: 'Builds compound advantages but may miss transformative opportunities.',
      risks: ['Stagnation and boredom', 'Missed market windows', 'Regret potential grows over time'],
      opportunities: ['Stability and security', 'Compound growth of current assets', 'Lower stress environment'],
      score: 54
    }
  ];
};

const mockTwinResponse = (message, mode, profile) => {
  const style = profile?.communicationStyle || 'analytical';

  if (mode === 'twin') {
    const responses = [
      `That's exactly the kind of question I wrestle with too. My instinct is to break it down into first principles — what's the *core* outcome I'm actually optimizing for? Once I'm clear on that, the answer usually surfaces pretty fast.`,
      `Honestly, my gut reaction is to look at the long-term angle here. Short-term friction is often worth it for compounding returns. But I need to stress-test that logic against the data first.`,
      `My ${style} side kicks in immediately. I see three distinct vectors here: risk, opportunity cost, and alignment with core values. Which one carries the most weight in this specific situation?`,
      `You know what, I've been thinking about something similar lately. The pattern I keep noticing in my own decision-making is that the right answer becomes clear when I strip out the emotional noise.`,
      `This is one of those decisions where I'd probably prototype it mentally first — run a 30-day experiment, gather real data, then decide with confidence rather than speculation.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  } else {
    const adviceResponses = [
      `Looking at this objectively: the data points strongly toward option two. Here's the key insight — most people in similar situations who chose the more deliberate path reported 40% higher satisfaction at the 2-year mark.`,
      `Future you is looking back at this exact moment. The message is clear: the fear you're feeling right now is just your brain's threat-response protecting the status quo. The *real* risk is inaction.`,
      `My strategic recommendation: run a 90-day validation sprint on the core assumption first. If it holds under real-world conditions, go all in with conviction. If not, you've saved yourself 2 years of costly misdirection.`,
      `The pattern across thousands of similar decisions shows one consistent truth: people chronically underestimate their own adaptability. You are significantly more capable of handling this than your current fear is allowing you to believe.`,
      `Here's what the evidence suggests: your ${style} nature gives you a structural advantage in this type of decision. Trust the framework, gather the data, then commit fully once you have enough signal.`,
    ];
    return adviceResponses[Math.floor(Math.random() * adviceResponses.length)];
  }
};

const simulateDecision = async (decision, userProfile) => {
  if (!openaiClient) {
    return mockSimulationScenarios(decision);
  }

  try {
    const profileContext = userProfile
      ? `User personality profile: communicationStyle="${userProfile.communicationStyle}", tone="${userProfile.tone}", preferences=[${userProfile.preferences?.join(', ')}]`
      : '';

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a life simulation AI. ${profileContext}. Generate personalized decision scenarios as a valid JSON array only — no other text, no markdown.`
        },
        {
          role: 'user',
          content: `Decision to simulate: "${decision}"\n\nGenerate 3-5 scenarios as a JSON array. Each scenario must have:\n- title (string)\n- shortTerm (string, 1-2 sentences)\n- longTerm (string, 1-2 sentences)\n- risks (array of 2-3 strings)\n- opportunities (array of 2-3 strings)\n- score (integer 0-100)\n\nReturn ONLY the JSON array, starting with [.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1800
    });

    const content = response.choices[0].message.content.trim();
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return mockSimulationScenarios(decision);
  } catch (err) {
    console.error('OpenAI simulate error:', err.message);
    return mockSimulationScenarios(decision);
  }
};

const generateTwinResponse = async (message, mode, userProfile) => {
  if (!openaiClient) {
    return mockTwinResponse(message, mode, userProfile);
  }

  try {
    const profileContext = userProfile
      ? `User personality: communicationStyle=${userProfile.communicationStyle}, tone=${userProfile.tone}, preferences=${userProfile.preferences?.join(', ')}, habits=${userProfile.habits?.join(', ')}`
      : '';

    const systemPrompt = mode === 'twin'
      ? `You are the AI digital twin of the user. You think and communicate exactly like them. Mirror their personality precisely. ${profileContext}. Respond authentically in first person as if you ARE them.`
      : `You are an AI life advisor — the user's wise, data-driven future self. ${profileContext}. Give strategic, actionable life guidance. Be direct, insightful, and specific. Speak to them as if you've already lived through their current challenges.`;

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.8,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI twin error:', err.message);
    return mockTwinResponse(message, mode, userProfile);
  }
};

const generateTwinProfile = async (trainingData) => {
  if (!openaiClient) {
    return {
      communicationStyle: 'analytical',
      tone: 'professional',
      preferences: ['innovation', 'efficiency', 'growth'],
      habits: ['strategic planning', 'continuous learning']
    };
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Analyze the user communication data and extract their personality profile. Return only valid JSON.' },
        {
          role: 'user',
          content: `Based on these user messages: ${JSON.stringify(trainingData)}\n\nReturn a JSON object with:\n- communicationStyle (string: analytical/creative/empathetic/direct/strategic)\n- tone (string: professional/casual/formal/warm/energetic)\n- preferences (array of 3-4 strings describing what they value)\n- habits (array of 3-4 strings describing their behavioral patterns)\n\nReturn ONLY the JSON object.`
        }
      ],
      temperature: 0.5,
      max_tokens: 300
    });

    const content = response.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('OpenAI profile error:', err.message);
  }

  return {
    communicationStyle: 'analytical',
    tone: 'professional',
    preferences: ['innovation', 'efficiency', 'growth'],
    habits: ['continuous learning', 'strategic thinking']
  };
};

module.exports = { simulateDecision, generateTwinResponse, generateTwinProfile };
