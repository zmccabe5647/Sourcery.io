import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface TemplateResponse {
  subject: string;
  content: string;
}

const templates: Record<string, TemplateResponse[]> = {
  sales: [
    {
      subject: "Improving {{company}}'s sales performance",
      content: `Hi {{first_name}},

I've been following {{company}}'s growth in the {{industry}} space, and I noticed an opportunity to potentially improve your sales performance.

Our platform has helped similar companies in the {{industry}} sector increase their conversion rates by 25-30% through automated, personalized outreach.

Would you be open to a quick 15-minute call this week to discuss how we could help {{company}} achieve similar results?

Best regards,
[Your name]`
    },
    {
      subject: "Boost {{company}}'s revenue with proven strategies",
      content: `Hi {{first_name}},

I've been researching companies in the {{industry}} sector and was particularly impressed by {{company}}'s approach to market challenges.

We specialize in helping {{industry}} companies optimize their sales processes, and our clients typically see:
• 40% increase in qualified leads
• 2x faster sales cycle
• 25% higher close rates

I'd love to share some specific ideas for {{company}}. Would you be open to a brief call this week?

Best regards,
[Your name]`
    },
    {
      subject: "Quick idea for {{company}}'s sales growth",
      content: `Hi {{first_name}},

I noticed {{company}}'s recent expansion in the {{industry}} market and wanted to reach out with a specific opportunity.

We've developed a unique approach that has helped similar companies in the {{industry}} space achieve remarkable sales growth:
• Automated lead qualification
• Personalized engagement sequences
• AI-powered conversion optimization

Could we schedule a 15-minute call to explore how these strategies might benefit {{company}}?

Best regards,
[Your name]`
    }
  ],
  marketing: [
    {
      subject: "Enhancing {{company}}'s marketing strategy",
      content: `Hi {{first_name}},

I came across {{company}}'s marketing initiatives in the {{industry}} space and wanted to reach out with some ideas.

We've developed innovative strategies that have helped companies like yours in the {{industry}} sector achieve:
• 40% increase in engagement rates
• 2x improvement in lead quality
• Significant reduction in customer acquisition costs

Would you be interested in learning how we could adapt these strategies for {{company}}?

Best regards,
[Your name]`
    },
    {
      subject: "Transform {{company}}'s digital presence",
      content: `Hi {{first_name}},

Your recent marketing campaigns at {{company}} caught my attention, and I see tremendous potential for growth in the {{industry}} space.

We've pioneered a data-driven approach that has delivered exceptional results for similar companies:
• 3x increase in organic reach
• 45% higher conversion rates
• Substantial ROI improvement

I'd love to share some specific insights about how we could amplify {{company}}'s market presence.

Best regards,
[Your name]`
    },
    {
      subject: "Innovative marketing solutions for {{company}}",
      content: `Hi {{first_name}},

I've been following {{company}}'s growth in the {{industry}} sector and noticed an opportunity to significantly enhance your market impact.

Our team has developed cutting-edge strategies that combine:
• AI-powered audience targeting
• Advanced analytics and optimization
• Multi-channel campaign automation

Would you be interested in discussing how these approaches could benefit {{company}}?

Best regards,
[Your name]`
    }
  ],
  partnership: [
    {
      subject: "Strategic partnership opportunity - {{company}}",
      content: `Hi {{first_name}},

I'm reaching out because I see tremendous potential for collaboration between our companies in the {{industry}} sector.

{{company}}'s innovative approach aligns perfectly with our vision, and I believe a strategic partnership could create significant value for both organizations.

I'd love to schedule a brief call to explore potential synergies and discuss how we could work together to achieve mutual growth.

Best regards,
[Your name]`
    },
    {
      subject: "Collaboration opportunity with {{company}}",
      content: `Hi {{first_name}},

I've been impressed by {{company}}'s achievements in the {{industry}} space and believe there's a unique opportunity for us to create something exceptional together.

Our complementary strengths in the {{industry}} sector could lead to:
• Expanded market reach
• Enhanced product offerings
• Accelerated innovation

Would you be open to exploring this potential partnership?

Best regards,
[Your name]`
    },
    {
      subject: "Let's create something amazing together",
      content: `Hi {{first_name}},

{{company}}'s reputation for excellence in the {{industry}} sector is well-known, and I believe we have a unique opportunity to combine our strengths.

I envision a partnership that could:
• Drive revolutionary innovation
• Capture new market opportunities
• Deliver unprecedented value to customers

Could we schedule a brief call to discuss this potential collaboration?

Best regards,
[Your name]`
    }
  ],
  introduction: [
    {
      subject: "Quick introduction from a fellow {{industry}} professional",
      content: `Hi {{first_name}},

I hope this email finds you well. I recently came across {{company}} and was impressed by your contributions to the {{industry}} industry.

I lead a team that specializes in helping companies like yours streamline their operations and accelerate growth. Some of our clients in the {{industry}} space have seen remarkable improvements in their key metrics.

Would you be open to a brief conversation about how we might be able to add similar value to {{company}}?

Best regards,
[Your name]`
    },
    {
      subject: "Connecting with {{company}} - {{industry}} innovation",
      content: `Hi {{first_name}},

Your work at {{company}} in the {{industry}} space has caught my attention, particularly your innovative approach to industry challenges.

I've spent years helping companies in the {{industry}} sector optimize their operations and achieve sustainable growth. I believe my experience could be valuable to {{company}}'s continued success.

Would you be interested in connecting for a brief discussion?

Best regards,
[Your name]`
    },
    {
      subject: "Reaching out from the {{industry}} community",
      content: `Hi {{first_name}},

I came across {{company}}'s recent developments in the {{industry}} sector and was genuinely impressed by your forward-thinking approach.

Having worked with several leading companies in this space, I see some interesting opportunities for {{company}} to further strengthen its market position.

Could we schedule a quick call to exchange ideas and explore potential collaboration?

Best regards,
[Your name]`
    }
  ],
  followup: [
    {
      subject: "Following up - {{company}} opportunity",
      content: `Hi {{first_name}},

I wanted to follow up on my previous email about helping {{company}} optimize its operations in the {{industry}} space.

I understand you're likely busy, but I truly believe we could provide significant value to your team. We've recently helped another {{industry}} company achieve:
• 35% efficiency improvement
• 45% cost reduction
• 60% faster time-to-market

Would you be open to a quick 15-minute call this week to discuss these possibilities?

Best regards,
[Your name]`
    },
    {
      subject: "Quick check-in about {{company}}'s growth",
      content: `Hi {{first_name}},

I'm following up on my previous message regarding potential opportunities for {{company}} in the {{industry}} sector.

Since my last email, we've achieved some remarkable results with similar companies:
• Streamlined operations
• Increased productivity
• Enhanced market presence

I'd love to share these insights with you. Would you have 15 minutes for a quick discussion?

Best regards,
[Your name]`
    },
    {
      subject: "Re: {{company}} - Let's connect",
      content: `Hi {{first_name}},

I hope you've had a chance to review my previous message about helping {{company}} excel in the {{industry}} space.

I understand how busy things can get, but I believe a brief conversation could be incredibly valuable. Our recent client success stories in the {{industry}} sector have been remarkable.

Would you be open to a short call this week to explore these opportunities?

Best regards,
[Your name]`
    }
  ]
};

function analyzePrompt(prompt: string): string {
  const prompt_lower = prompt.toLowerCase();
  
  if (prompt_lower.includes('follow') || prompt_lower.includes('reminder')) {
    return 'followup';
  }
  if (prompt_lower.includes('sales') || prompt_lower.includes('revenue')) {
    return 'sales';
  }
  if (prompt_lower.includes('market') || prompt_lower.includes('brand')) {
    return 'marketing';
  }
  if (prompt_lower.includes('partner') || prompt_lower.includes('collaboration')) {
    return 'partnership';
  }
  return 'introduction';
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, exclude = [] } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    }

    // Analyze prompt and select appropriate template
    const templateType = analyzePrompt(prompt);
    const templateOptions = templates[templateType];

    // Filter out previously shown templates
    const availableTemplates = templateOptions.filter((_, index) => !exclude.includes(index));

    if (availableTemplates.length === 0) {
      // If all templates have been shown, start over
      const template = templateOptions[0];
      const response = {
        subject: template.subject,
        content: template.content.replace(
          '[Your name]',
          ['Alex', 'Sam', 'Jordan', 'Taylor'][Math.floor(Math.random() * 4)]
        ),
        templateIndex: 0,
        hasMore: true
      };

      return new Response(
        JSON.stringify(response),
        { 
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    }

    // Select a random template from available ones
    const randomIndex = Math.floor(Math.random() * availableTemplates.length);
    const selectedTemplate = availableTemplates[randomIndex];
    const originalIndex = templateOptions.indexOf(selectedTemplate);

    const response = {
      subject: selectedTemplate.subject,
      content: selectedTemplate.content.replace(
        '[Your name]',
        ['Alex', 'Sam', 'Jordan', 'Taylor'][Math.floor(Math.random() * 4)]
      ),
      templateIndex: originalIndex,
      hasMore: exclude.length < templateOptions.length - 1
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
});