
import { GoogleGenAI } from "@google/genai";
import { LetterData, Tone } from "../types";

const getTemplateLetter = (data: LetterData): string => {
  const { user, subscription, tone } = data;
  const date = new Date().toLocaleDateString();
  
  let toneAdjustment = "";
  if (tone === Tone.FIRM) {
    toneAdjustment = "\nPlease be advised that this request is final. I expect a written confirmation of this cancellation and an assurance that no further charges will be applied to my account. If any further unauthorized billing occurs, I will be forced to escalate this matter.";
  } else if (tone === Tone.FRIENDLY) {
    toneAdjustment = "\nI have enjoyed using your service, but I have decided to cancel at this time. Thank you for your support and assistance with this request.";
  } else if (tone === Tone.DIRECT) {
    toneAdjustment = "\nPlease process this request immediately. No further communication is required other than a confirmation of termination.";
  }

  return `${user.fullName}
${user.address || ''}
${user.email}
${user.phone || ''}

Date: ${date}

RE: Cancellation of ${subscription.serviceName} Subscription
Account Number: ${subscription.accountNumber || 'N/A'}

To the Customer Service Team at ${subscription.serviceName},

I am writing to formally request the cancellation of my ${subscription.subscriptionPlan || ''} subscription, effective ${subscription.effectiveDate}.

${subscription.cancellationReason ? `Reason for cancellation: ${subscription.cancellationReason}\n` : ''}
Please stop all recurring payments associated with this account immediately. ${toneAdjustment}

Thank you for your prompt attention to this matter.

Sincerely,

${user.fullName}`;
};

export const generateCancellationLetter = async (data: LetterData): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  // If no API key is present, immediately use the template to ensure functionality
  if (!apiKey || apiKey === 'undefined') {
    console.warn("API Key missing, falling back to local template.");
    return getTemplateLetter(data);
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Generate a professional subscription cancellation letter based on the following details:
    
    User Name: ${data.user.fullName}
    User Email: ${data.user.email}
    User Phone: ${data.user.phone}
    User Address: ${data.user.address}
    
    Service Provider: ${data.subscription.serviceName}
    Account/Member Number: ${data.subscription.accountNumber}
    Plan Type: ${data.subscription.subscriptionPlan}
    Reason for Cancellation: ${data.subscription.cancellationReason || "Not specified"}
    Requested End Date: ${data.subscription.effectiveDate}
    
    Tone: ${data.tone}
    
    Rules for the letter:
    1. Include standard business letter formatting.
    2. Be clear about the request to terminate services and stop all future billing.
    3. If the tone is 'Firm & Legalistic', mention consumer rights and request written confirmation.
    4. If the tone is 'Polite & Friendly', thank them for the service but state the need to move on.
    5. Ensure the letter is complete and ready for use.
    6. Do not use placeholders like [Your Name].
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || getTemplateLetter(data);
  } catch (error) {
    console.error("Gemini API Error, using fallback template:", error);
    return getTemplateLetter(data);
  }
};

export const suggestCancellationReason = async (serviceName: string): Promise<string[]> => {
  const defaultReasons = ["Cost is too high", "No longer using the service", "Found a better alternative", "Moving to a different location"];
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined') return defaultReasons;

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Provide 4 short, professional reasons someone might want to cancel a subscription for "${serviceName}". Return them as a simple list.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    const text = response.text || "";
    const lines = text.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^\d+\.\s*/, '').trim());
    return lines.length > 0 ? lines.slice(0, 4) : defaultReasons;
  } catch {
    return defaultReasons;
  }
};
