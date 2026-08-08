import { GoogleGenAI, Type } from '@google/genai';
import { AIClassificationResult, IssueCategory, IssuePriority } from '../types.js';

/**
 * AI Issue Classification Engine
 * Uses Gemini 3.6 Flash with structured JSON output schema and fallback rule-based classifier.
 */
export async function classifyIssue(
  title: string,
  description: string,
  location: string
): Promise<AIClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = apiKey && apiKey.trim().length > 0 && !apiKey.includes('replace-with') && apiKey !== 'MY_GEMINI_API_KEY';

  if (isConfigured) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `Analyze the following incoming municipal/civic/business issue and classify it according to standard operational categories.

TITLE: ${title}
DESCRIPTION: ${description}
LOCATION: ${location}

Task:
1. Identify the primary category from: ["Road", "Electricity", "Water", "Garbage", "Public Safety", "Maintenance", "IT", "Other"]
2. Identify a specific subcategory (e.g., Pothole, Street Light Failure, Pipe Leak, Garbage Overflow, Electrical Hazard, Network Outage).
3. Determine priority level from: ["Critical", "High", "Medium", "Low"] based on urgency, public safety risk, service disruption, and affected area.
4. Recommend the exact department name from: ["Road Maintenance", "Electrical", "Water Department", "Sanitation", "Public Safety", "Building Maintenance", "IT Support", "General Services"]
5. Recommend the required skill name (e.g., "Road Repair", "Electrical Repair", "Plumbing", "Waste Management", "Public Safety Ops", "Network/IT").
6. Provide a 1-sentence concise summary.
7. Provide clear step-by-step reasoning explaining why this priority and category were selected.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'One of Road, Electricity, Water, Garbage, Public Safety, Maintenance, IT, Other'
              },
              subcategory: { type: Type.STRING },
              priority: {
                type: Type.STRING,
                description: 'One of Critical, High, Medium, Low'
              },
              department: { type: Type.STRING },
              required_skill: { type: Type.STRING },
              summary: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            },
            required: ['category', 'subcategory', 'priority', 'department', 'required_skill', 'summary', 'reasoning']
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        const validated = validateAndNormalizeResult(parsed);
        return { ...validated, used_fallback: false };
      }
    } catch (err: any) {
      const isQuota = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuota) {
        console.log('ℹ️ Gemini API quota limit reached (429), seamlessly using rule-based classifier.');
      } else {
        console.warn('Gemini AI classification unavailable, using fallback rule classifier:', err?.message || err);
      }
    }
  }

  // Fallback Rule Classifier if Gemini API is missing, fails, or times out
  return runFallbackRuleClassifier(title, description, location);
}

function validateAndNormalizeResult(raw: any): AIClassificationResult {
  const allowedCategories: IssueCategory[] = ['Road', 'Electricity', 'Water', 'Garbage', 'Public Safety', 'Maintenance', 'IT', 'Other'];
  const allowedPriorities: IssuePriority[] = ['Critical', 'High', 'Medium', 'Low'];

  let category: IssueCategory = allowedCategories.includes(raw.category) ? raw.category : 'Other';
  let priority: IssuePriority = allowedPriorities.includes(raw.priority) ? raw.priority : 'Medium';

  return {
    category,
    subcategory: raw.subcategory || 'General Issue',
    priority,
    department: raw.department || getDepartmentForCategory(category),
    required_skill: raw.required_skill || getSkillForCategory(category),
    summary: raw.summary || `${category} issue reported at ${raw.location || 'location'}.`,
    reasoning: raw.reasoning || 'Automated classification based on structured content inspection.',
    confidence: typeof raw.confidence === 'number' ? Math.min(1.0, Math.max(0.1, raw.confidence)) : 0.92,
    used_fallback: false
  };
}

function getDepartmentForCategory(category: IssueCategory): string {
  switch (category) {
    case 'Road': return 'Road Maintenance';
    case 'Electricity': return 'Electrical';
    case 'Water': return 'Water Department';
    case 'Garbage': return 'Sanitation';
    case 'Public Safety': return 'Public Safety';
    case 'Maintenance': return 'Building Maintenance';
    case 'IT': return 'IT Support';
    default: return 'General Services';
  }
}

function getSkillForCategory(category: IssueCategory): string {
  switch (category) {
    case 'Road': return 'Road Repair';
    case 'Electricity': return 'Electrical Repair';
    case 'Water': return 'Plumbing';
    case 'Garbage': return 'Waste Management';
    case 'Public Safety': return 'Public Safety Ops';
    case 'Maintenance': return 'HVAC / General Repair';
    case 'IT': return 'Network/IT';
    default: return 'General Operations';
  }
}

/**
 * Deterministic Fallback Rule Classifier
 */
export function runFallbackRuleClassifier(title: string, description: string, location: string): AIClassificationResult {
  const text = `${title} ${description} ${location}`.toLowerCase();

  let category: IssueCategory = 'Other';
  let subcategory = 'General Issue';
  let priority: IssuePriority = 'Medium';
  let required_skill = 'General Operations';

  // Keyword Matching
  if (text.includes('pothole') || text.includes('road') || text.includes('asphalt') || text.includes('traffic problems') || text.includes('pavement')) {
    category = 'Road';
    subcategory = text.includes('pothole') ? 'Pothole' : 'Road Damage';
    required_skill = 'Road Repair';
  } else if (text.includes('street light') || text.includes('light not working') || text.includes('electricity') || text.includes('spark') || text.includes('wire') || text.includes('power')) {
    category = 'Electricity';
    subcategory = text.includes('light') ? 'Street Light Outage' : 'Electrical Wire Hazard';
    required_skill = 'Electrical Repair';
  } else if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('drain') || text.includes('flooding')) {
    category = 'Water';
    subcategory = text.includes('pipe') || text.includes('leak') ? 'Pipe Leak' : 'Drainage Blockage';
    required_skill = 'Plumbing';
  } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('uncollected') || text.includes('dumpster')) {
    category = 'Garbage';
    subcategory = 'Garbage Overflow';
    required_skill = 'Waste Management';
  } else if (text.includes('danger') || text.includes('fire') || text.includes('hazard') || text.includes('threat') || text.includes('accident') || text.includes('blocked gate')) {
    category = 'Public Safety';
    subcategory = 'Public Hazard';
    required_skill = 'Public Safety Ops';
  } else if (text.includes('elevator') || text.includes('ac') || text.includes('door') || text.includes('maintenance') || text.includes('hvac')) {
    category = 'Maintenance';
    subcategory = 'Facility Maintenance';
    required_skill = 'HVAC / General Repair';
  } else if (text.includes('wifi') || text.includes('computer') || text.includes('network') || text.includes('server') || text.includes('kiosk')) {
    category = 'IT';
    subcategory = 'Network / System Issue';
    required_skill = 'Network/IT';
  }

  // Urgency & Priority Detection
  if (
    text.includes('huge') || text.includes('large') || text.includes('traffic problems') ||
    text.includes('school') || text.includes('hospital') || text.includes('three days') ||
    text.includes('causing traffic') || text.includes('emergency')
  ) {
    priority = 'High';
  }

  if (text.includes('sparking') || text.includes('fire') || text.includes('immediate danger') || text.includes('life threat')) {
    priority = 'Critical';
  }

  if (text.includes('small') || text.includes('minor') || text.includes('kiosk')) {
    priority = 'Low';
  }

  const department = getDepartmentForCategory(category);

  return {
    category,
    subcategory,
    priority,
    department,
    required_skill,
    summary: `${subcategory} detected in ${category} category at ${location || 'specified area'}.`,
    reasoning: `Rule-based classifier detected key operational patterns matching ${category} (${subcategory}) with ${priority} priority.`,
    confidence: 0.88,
    used_fallback: true
  };
}
