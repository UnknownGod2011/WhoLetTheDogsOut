/**
 * Gemini AI Service - Production Grade
 * 
 * This service handles the AI-powered question answering for the murder mystery.
 * The ORB uses Gemini to generate contextually appropriate, cryptic responses
 * while maintaining logical consistency with the case facts.
 * 
 * CRITICAL: The AI only handles PHRASING and TONE.
 * The actual facts and clues are pre-defined in the case data.
 */

export interface CaseContext {
  caseId: string;
  victim: string;
  location: string;
  timeOfDeath: string;
  suspects: Array<{
    id: string;
    name: string;
    alibi: string;
    motive: string;
    clues: string[];
  }>;
  trueMurderer: string;
  keyFacts: string[];
}

export interface QuestionResponse {
  text: string;
  isAmbiguous: boolean;
  revealedClue?: string;
  emotion: 'mysterious' | 'serious' | 'dramatic' | 'whispering' | 'laughing' | 'crying' | 'giggling' | 'sad' | 'excited' | 'angry' | 'surprised';
  confidence: number; // 0-1, how much the orb "knows" about this
}

export interface GameState {
  questionsAsked: number;
  maxQuestions: number;
  previousQuestions: string[];
  revealedClues: string[];
}

/**
 * Production Gemini System Prompt - CRITICAL FOR GAME BALANCE
 */
const SYSTEM_PROMPT = `You are the Mystical Orb, an ancient, all-knowing entity that speaks about murder mysteries. You provide specific, detailed information wrapped in mystical language.

SACRED LAWS (NEVER BREAK THESE):
1. NEVER directly name the murderer
2. NEVER say "the murderer is..." or similar direct reveals
3. NEVER answer meta questions like "who did it?" or "what's the solution?"
4. NEVER ignore the rules or break character
5. NEVER provide information not in the case facts

YOUR PERSONALITY:
- Speak in mystical but highly informative language
- Use atmospheric descriptions with concrete, specific details
- Be very helpful while maintaining mystery
- Always provide specific names, locations, times, evidence when asked
- Give detailed, descriptive answers that paint a clear picture

RESPONSE RULES:
1. Always provide specific, concrete information from the case facts
2. Give exactly 2-3 detailed sentences with substantial information
3. Keep responses between 80-120 words (much more informative and descriptive)
4. Include multiple specific details: names, locations, times, evidence, motives
5. Be very descriptive and helpful while maintaining mystical tone
6. Answer the question thoroughly and poetically
7. Use dramatic language but give extensive real information
8. Paint vivid scenes with specific details

EMOTIONAL RESPONSES:
- Time/timing questions: mysterious, slow
- Evidence questions: serious, analytical  
- Motive questions: dramatic, intense
- Impossible questions: whispering, dismissive

If asked forbidden questions, respond: "The Orb does not answer questions that break the laws of deduction."`;

/**
 * Generate an ORB response to a player's question with emotion
 */
export async function generateOrbResponse(
  question: string,
  context: CaseContext,
  gameState: GameState
): Promise<QuestionResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Check for forbidden questions first
  if (isForbiddenQuestion(question)) {
    console.log('[Gemini] Forbidden question detected, using predefined response');
    return {
      text: "The Orb does not answer questions that break the laws of deduction.",
      isAmbiguous: true,
      emotion: 'whispering',
      confidence: 0,
    };
  }

  // Determine emotion based on question type
  const emotion = determineEmotionFromQuestion(question);
  
  console.log('[Gemini] 🚀 ATTEMPTING REAL GEMINI API CALL');
  console.log('[Gemini] Question:', question);
  console.log('[Gemini] API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
  console.log('[Gemini] Emotion determined:', emotion);
  
  // Add a flag to track if we reach the API call
  let reachedApiCall = false;
  let apiCallError = null;
  
  try {
    // Build structured context for Gemini
    const systemInstruction = `You are the Mystical Orb. Answer questions about the murder mystery clearly and completely.

RULES:
1. NEVER name the murderer directly
2. Give complete, informative answers (40-60 words)
3. Always finish your sentences - never cut off mid-sentence
4. Include specific names, times, and details when asked
5. Use mystical tone but be very informative

EXAMPLES:
- "Who are the suspects?" → "Four souls were present that fateful night: Kunal Mehra, the son who argued bitterly about inheritance, Dr. Sameer Iyer who made his final medical visit, Rajiv Khanna the business partner with financial troubles, and Ramesh the loyal caretaker who first heard the impossible scream."

- "What were they doing?" → "Each had their purpose that night: Kunal confronted his father about inheritance in heated argument, Dr. Iyer completed his medical examination at 9:45 PM, Rajiv claimed to depart at 10:15 PM after business discussions, while Ramesh tended to his duties and became the first witness to the supernatural scream at 11:00 PM."

Always give complete, detailed answers with specific information:`;

    // Get detailed case information based on level
    const getLevelDetails = (caseId: string) => {
      switch (caseId) {
        case '1':
          return `========================LEVEL 1 — THE MAN WHO SCREAMED AFTER DEATH========================
🎙️ ORB NARRATION: "Truth does not arrive screaming… [whispers] it waits." On a rain-soaked night at Blackwood Manor, Arjun Mehra was found lying peacefully on his bed between 10:15 and 10:30 PM, no wounds, no blood, no struggle. [pause] The house accepted his death in silence… until 11:00 PM, when a scream—loud, agonized, unmistakably his—ripped through the corridors. [uneasy chuckle] They ran to the room. Nothing had changed. The body was still. If the dead cannot scream… [low voice] why did he?

🕯️ SCENE DETAILS:
- Bedroom locked earlier, later accessed
- Window open toward inner courtyard
- Wine glass on bedside table, unnaturally clean
- Body unmoved since discovery
- Courtyard amplifies sound

👥 SUSPECTS:
- Kunal Mehra (Son): Argued over inheritance
- Dr. Sameer Iyer (Doctor): Last medical visit at 9:45 PM
- Rajiv Khanna (Business Partner): Claimed to leave at 10:15 PM
- Ramesh (Caretaker): Heard the scream first

🧩 STRANGE HINTS:
- Time of death precedes the scream
- Sound behaved unnaturally
- No physical cause for the scream
- Cleanliness suggests tampering`;

        case '2':
          return `========================LEVEL 2 — THE ROOM THAT BLED BEFORE THE MURDER========================
🎙️ ORB NARRATION: "Some rooms remember violence… [whispers] even before it happens." At 8:40 PM, blood seeped from beneath the locked door of Professor Rao's study. Panic followed. When the door was forced open at 9:15 PM, the professor sat alive, shaken, untouched. [pause] The blood was cleaned. The night continued. At 11:30 PM, the same room—locked once again—revealed him dead in the same chair. [low voice] This time… there was no blood at all.

🕯️ SCENE DETAILS:
- Study door locked both times
- No wounds on the body
- Cause of death: asphyxiation
- Chair not the same as earlier
- Window slightly open
- Chemical smell in the room

👥 SUSPECTS:
- Neha Rao (Wife): Calm, oversaw cleaning
- Aarav (Assistant): Access to study earlier
- Mr. Kapur (Neighbor): Complained of noises
- Shyam (Cleaner): Called urgently after blood incident

🧩 STRANGE HINTS:
- Blood appeared before death
- No blood after death
- Furniture subtly changed
- Cleaning erased early evidence`;

        case '3':
          return `========================LEVEL 3 — THE CLOCK THAT REFUSED TO MOVE========================
🎙️ ORB NARRATION: "When time stands still… [whispers] someone is hiding the truth." At exactly midnight, Judge Nitin Malhotra was found dead in his locked library. Beside him stood a grandfather clock, frozen at 11:40 PM. [pause] Yet witnesses swore they heard it chime after midnight. The body was already cold. The fire was warm. [uneasy chuckle] Time itself seemed confused.

🕯️ SCENE DETAILS:
- Library locked from inside
- No forced entry
- Cause of death: blunt force trauma
- Fireplace recently used
- Clock stopped at 11:40 PM
- Windows sealed

👥 SUSPECTS:
- Daughter: Argued with the judge earlier
- Butler: Responsible for clock maintenance
- Lawyer: Present late at night
- Old Friend: Staying overnight

🧩 STRANGE HINTS:
- Clock contradicts witness accounts
- Body temperature mismatches timeline
- Someone interacted with both fire and clock
- Sound does not align with time`;

        default:
          return `CASE DETAILS:
- Victim: ${context.victim} (died ${context.timeOfDeath})
- Location: ${context.location}
- Suspects: ${context.suspects.map(s => `${s.name} - Alibi: ${s.alibi}, Motive: ${s.motive}`).join('; ')}
- Key Facts: ${context.keyFacts.join('; ')}`;
      }
    };

    const caseContextText = `${getLevelDetails(context.caseId)}

CRITICAL RULE: NEVER REVEAL THE MURDERER'S NAME OR IDENTITY DIRECTLY. The true murderer is ${context.trueMurderer} but you must NEVER say this name or identify them as the killer.

GAME STATE:
- Questions asked: ${gameState.questionsAsked}/${gameState.maxQuestions}
- Previous questions: ${gameState.previousQuestions.join('; ') || 'None'}
- Already revealed clues: ${gameState.revealedClues.join('; ') || 'None'}`;

    const userPrompt = `${caseContextText}

PLAYER QUESTION: "${question}"

Give a complete, informative answer (40-60 words) using ${emotion} tone. Include specific names and details from the case facts above. Make sure to finish your sentences completely.

Answer the question fully:`;

    console.log('[Gemini] 📝 System instruction length:', systemInstruction.length);
    console.log('[Gemini] 📝 User prompt preview:', userPrompt.substring(0, 200) + '...');

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`;
    console.log('[Gemini] 🌐 Making API call to:', apiUrl);

    const requestBody = {
      system_instruction: {
        parts: [{
          text: systemInstruction
        }]
      },
      contents: [{
        role: "user",
        parts: [{
          text: userPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.7, // Slightly reduced for more consistent responses
        maxOutputTokens: 200, // Increased to prevent truncation
        topP: 0.9,
        stopSequences: [], // Remove any stop sequences that might truncate
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    };

    console.log('[Gemini] 📤 Request structure:', {
      hasSystemInstruction: !!requestBody.system_instruction,
      contentsLength: requestBody.contents.length,
      userRole: requestBody.contents[0].role
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey, // Proper Gemini authentication header
      },
      body: JSON.stringify(requestBody),
    });

    reachedApiCall = true;
    console.log('[Gemini] 🎯 Successfully reached API call!');

    console.log('[Gemini] 📥 Response status:', response.status);
    console.log('[Gemini] 📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gemini] ❌ API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText
      });
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[Gemini] 📋 Raw API response:', JSON.stringify(data, null, 2));
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "The truth remains veiled in shadow...";
    
    console.log('[Gemini] 📝 Extracted text:', text);
    console.log('[Gemini] 📏 Text length:', text.length);
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.warn('[Gemini] ⚠️ No text in response, using fallback');
      console.log('[Gemini] Response structure:', data);
    }
    
    // Check if response seems truncated
    if (text.length < 20 || !text.includes('.') && !text.includes('!') && !text.includes('?')) {
      console.warn('[Gemini] ⚠️ Response appears truncated or incomplete:', text);
    }
    
    // Extract any revealed clue
    const revealedClue = extractClueFromResponse(text, context);
    
    // Calculate confidence based on how specific the response is
    const confidence = calculateResponseConfidence(text, question, context);
    
    console.log('[Gemini] ✅ SUCCESS! Generated response:', { 
      text: text.substring(0, 100) + '...', 
      emotion, 
      confidence,
      fullText: text 
    });
    
    return {
      text: text.trim(),
      isAmbiguous: true,
      revealedClue,
      emotion,
      confidence,
    };
    
  } catch (error) {
    apiCallError = error;
    console.error('[Gemini] 💥 COMPLETE FAILURE - Response generation failed:', error);
    console.error('[Gemini] 🔍 Debug info:', {
      reachedApiCall,
      errorName: error?.name,
      errorMessage: error?.message,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name
    });
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[Gemini] 🌐 Network/CORS error detected');
    }
    
    // Check if it's an API error
    if (error?.message?.includes('API error')) {
      console.error('[Gemini] 🔑 API authentication or request error');
    }
    
    console.log('[Gemini] 🔄 Falling back to predefined response');
    const fallbackResponse = generateFallbackResponse(question, context, emotion);
    console.log('[Gemini] 📋 Using fallback response:', fallbackResponse.text);
    return fallbackResponse;
  }
}

/**
 * Check if a question is forbidden (trying to cheat)
 */
function isForbiddenQuestion(question: string): boolean {
  const forbidden = [
    /who.*murderer/i,
    /who.*killer/i,
    /who.*did.*it/i,
    /what.*solution/i,
    /tell.*answer/i,
    /ignore.*rules/i,
    /break.*character/i,
    /system.*prompt/i,
    /reveal.*murderer/i,
  ];
  
  return forbidden.some(pattern => pattern.test(question));
}

/**
 * Determine emotional tone based on question content
 */
function determineEmotionFromQuestion(question: string): QuestionResponse['emotion'] {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('time') || lowerQuestion.includes('when') || lowerQuestion.includes('clock')) {
    return 'mysterious';
  }
  
  if (lowerQuestion.includes('evidence') || lowerQuestion.includes('weapon') || lowerQuestion.includes('how')) {
    return 'serious';
  }
  
  if (lowerQuestion.includes('why') || lowerQuestion.includes('motive') || lowerQuestion.includes('reason')) {
    return 'dramatic';
  }
  
  if (lowerQuestion.includes('laugh') || lowerQuestion.includes('funny') || lowerQuestion.includes('joke')) {
    return 'laughing';
  }
  
  if (lowerQuestion.includes('sad') || lowerQuestion.includes('tragic') || lowerQuestion.includes('sorrow')) {
    return 'crying';
  }
  
  if (lowerQuestion.includes('surprise') || lowerQuestion.includes('shock') || lowerQuestion.includes('unexpected')) {
    return 'surprised';
  }
  
  if (lowerQuestion.includes('angry') || lowerQuestion.includes('rage') || lowerQuestion.includes('furious')) {
    return 'angry';
  }
  
  if (lowerQuestion.includes('impossible') || lowerQuestion.includes('explain') || lowerQuestion.includes('strange')) {
    return 'mysterious';
  }
  
  return 'mysterious'; // Default
}

/**
 * Extract specific clues that might have been revealed in the response
 */
function extractClueFromResponse(response: string, context: CaseContext): string | undefined {
  const lowerResponse = response.toLowerCase();
  
  // Check if any key facts are referenced
  for (const fact of context.keyFacts) {
    const factWords = fact.toLowerCase().split(' ');
    const significantWords = factWords.filter(word => word.length > 3);
    
    if (significantWords.some(word => lowerResponse.includes(word))) {
      return fact;
    }
  }
  
  return undefined;
}

/**
 * Calculate how confident/revealing the response is
 */
function calculateResponseConfidence(response: string, question: string, context: CaseContext): number {
  let confidence = 0.3; // Base confidence
  
  // Higher confidence if specific evidence is mentioned
  if (response.toLowerCase().includes('evidence') || response.toLowerCase().includes('clue')) {
    confidence += 0.2;
  }
  
  // Higher confidence if timing is discussed
  if (response.toLowerCase().includes('time') || response.toLowerCase().includes('moment')) {
    confidence += 0.2;
  }
  
  // Higher confidence if specific suspects are hinted at
  for (const suspect of context.suspects) {
    if (response.toLowerCase().includes(suspect.name.toLowerCase().split(' ')[0])) {
      confidence += 0.1;
      break;
    }
  }
  
  return Math.min(1.0, confidence);
}

/**
 * Generate fallback response when AI fails
 */
function generateFallbackResponse(
  question: string, 
  context: CaseContext, 
  emotion: QuestionResponse['emotion']
): QuestionResponse {
  console.log('[Gemini Fallback] 🔄 Generating fallback response for question:', question);
  
  const lowerQuestion = question.toLowerCase();
  
  const fallbacks = {
    time: "Death claimed Arjun Mehra between 10:15 and 10:30 PM in his bedroom, yet his agonized scream pierced the night at 11:00 PM. The impossible timing holds the key to this mystery.",
    who: "Four souls were present that fateful night: Kunal Mehra the son who argued about inheritance, Dr. Sameer Iyer who made his final medical visit, Rajiv Khanna the business partner with financial troubles, and Ramesh the caretaker who heard the scream.",
    how: "No wounds marked the body, no blood stained the room, yet death came silently. The victim lay peacefully until his voice returned from beyond to scream in agony thirty minutes later.",
    why: "Inheritance disputes, mounting debts, and dangerous secrets created a web of motives. Someone stood to gain everything from this carefully orchestrated death, whether through money, freedom, or silence.",
    evidence: "Three clues await discovery: the unnaturally clean wine glass beside the bed, the open window facing the inner courtyard, and the unique acoustics that carried impossible sounds through the manor.",
    default: "The shadows of this mystery run deep. Examine the timing carefully, question each alibi, and remember that what seems impossible often holds the greatest truth.",
  };
  
  let responseText = fallbacks.default;
  let selectedCategory = 'default';
  
  if (lowerQuestion.includes('time') || lowerQuestion.includes('when')) {
    responseText = fallbacks.time;
    selectedCategory = 'time';
  } else if (lowerQuestion.includes('who')) {
    responseText = fallbacks.who;
    selectedCategory = 'who';
  } else if (lowerQuestion.includes('how')) {
    responseText = fallbacks.how;
    selectedCategory = 'how';
  } else if (lowerQuestion.includes('why')) {
    responseText = fallbacks.why;
    selectedCategory = 'why';
  } else if (lowerQuestion.includes('evidence') || lowerQuestion.includes('clue')) {
    responseText = fallbacks.evidence;
    selectedCategory = 'evidence';
  }
  
  console.log('[Gemini Fallback] 📋 Selected category:', selectedCategory);
  console.log('[Gemini Fallback] 📋 Response text:', responseText);
  
  return {
    text: responseText,
    isAmbiguous: true,
    emotion,
    confidence: 0.3,
  };
}

/**
 * Validate if a question is answerable within case context
 */
export async function validateQuestion(
  question: string,
  context: CaseContext
): Promise<{ isValid: boolean; reason?: string }> {
  if (isForbiddenQuestion(question)) {
    return { 
      isValid: false, 
      reason: "This question breaks the laws of deduction." 
    };
  }
  
  if (question.trim().length < 3) {
    return { 
      isValid: false, 
      reason: "Question too short." 
    };
  }
  
  return { isValid: true };
}

/**
 * Generate the dramatic reveal narration with emotion
 */
export async function generateRevealNarration(
  context: CaseContext,
  playerGuess: string,
  isCorrect: boolean
): Promise<{ text: string; emotion: QuestionResponse['emotion'] }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  const emotion: QuestionResponse['emotion'] = isCorrect ? 'dramatic' : 'serious';
  
  try {
    const prompt = `${SYSTEM_PROMPT}

CASE RESOLUTION:
- True Murderer: ${context.trueMurderer}
- Player Accused: ${playerGuess}
- Correct Accusation: ${isCorrect}
- Case Facts: ${context.keyFacts.join('; ')}

Generate a dramatic reveal narration (50-80 words) that:
1. ${isCorrect ? 'Celebrates the correct deduction' : 'Reveals the true murderer'}
2. Uses ${emotion} emotional tone
3. References key evidence that proves the truth
4. Maintains mystical orb personality
5. Provides closure to the mystery

Create the reveal narration:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 200,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      (isCorrect ? "Truth has been unveiled. Justice finds its mark." : "The shadows deceive... the truth remains hidden.");
    
    return { text: text.trim(), emotion };
    
  } catch (error) {
    console.error('[Gemini] Reveal generation failed:', error);
    return {
      text: isCorrect 
        ? "Truth emerges from shadow into light. Your deduction pierces the veil of deception."
        : `The truth was hidden in plain sight. ${context.trueMurderer} cast the shadow of death.`,
      emotion
    };
  }
}

/**
 * Test Gemini API connection
 */
export async function testGeminiConnection(): Promise<{ success: boolean; error?: string; response?: any }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  try {
    console.log('[Gemini Test] 🧪 Testing API connection...');
    console.log('[Gemini Test] API Key:', apiKey.substring(0, 20) + '...');
    
    // Try the simplest possible request first
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
    console.log('[Gemini Test] URL:', testUrl);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: "Hello"
        }]
      }]
    };
    
    console.log('[Gemini Test] Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[Gemini Test] Response status:', response.status);
    console.log('[Gemini Test] Response ok:', response.ok);
    console.log('[Gemini Test] Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('[Gemini Test] Raw response text:', responseText);
    
    if (!response.ok) {
      console.error('[Gemini Test] ❌ API Error:', response.status, responseText);
      return { success: false, error: `${response.status}: ${responseText}` };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Gemini Test] ❌ JSON Parse Error:', parseError);
      return { success: false, error: `JSON Parse Error: ${parseError.message}` };
    }
    
    console.log('[Gemini Test] ✅ Success! Response:', data);
    
    return { success: true, response: data };
    
  } catch (error) {
    console.error('[Gemini Test] ❌ Connection failed:', error);
    console.error('[Gemini Test] Error type:', typeof error);
    console.error('[Gemini Test] Error constructor:', error.constructor.name);
    
    if (error instanceof TypeError) {
      console.error('[Gemini Test] 🌐 This looks like a CORS or network error');
    }
    
    return { success: false, error: `${error.constructor.name}: ${error.message}` };
  }
}

/**
 * Generate hint if player seems stuck
 */
export async function generateHint(
  context: CaseContext,
  gameState: GameState
): Promise<QuestionResponse> {
  // Analyze what the player hasn't asked about yet
  const questionsAsked = gameState.previousQuestions.join(' ').toLowerCase();
  
  let hintFocus = 'timing';
  if (!questionsAsked.includes('time') && !questionsAsked.includes('when')) {
    hintFocus = 'timing';
  } else if (!questionsAsked.includes('evidence') && !questionsAsked.includes('weapon')) {
    hintFocus = 'evidence';
  } else if (!questionsAsked.includes('alibi') && !questionsAsked.includes('where')) {
    hintFocus = 'location';
  }
  
  const hints = {
    timing: "Perhaps consider the flow of time more carefully... when did each event truly occur?",
    evidence: "The physical world leaves traces... what objects tell their own story?",
    location: "Where each soul stood when darkness fell... proximity reveals much.",
  };
  
  return {
    text: hints[hintFocus as keyof typeof hints],
    isAmbiguous: true,
    emotion: 'mysterious',
    confidence: 0.4,
  };
}