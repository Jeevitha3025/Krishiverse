export const translations = {
  en: {
    welcome: "Welcome to KrishiGrow",
    getStarted: "Get Started",
    alreadyHaveAccount: "I Already Have Account",
    dashboard: "Dashboard",
    quests: "Quests",
    community: "Community",
    market: "Market",
    profile: "Profile",
    sustainableFarming: "Sustainable Farming",
    virtualFarm: "My Virtual Farm",
    todaysQuests: "Today's Quests",
    viewAll: "View All",
    completeQuest: "I Did It!",
    level: "Level",
    coins: "Coins",
    sustainability: "Sustainability",
    healthy: "Healthy",
    weatherAlert: "Weather Alert",
    quickTip: "Quick Tip",
  },
  hi: {
    welcome: "कृषिग्रो में आपका स्वागत है",
    getStarted: "शुरू करें",
    alreadyHaveAccount: "मेरा खाता पहले से है",
    dashboard: "डैशबोर्ड",
    quests: "कार्य",
    community: "समुदाय",
    market: "बाज़ार",
    profile: "प्रोफ़ाइल",
    sustainableFarming: "टिकाऊ खेती",
    virtualFarm: "मेरा वर्चुअल फार्म",
    todaysQuests: "आज के कार्य",
    viewAll: "सभी देखें",
    completeQuest: "मैंने किया!",
    level: "स्तर",
    coins: "सिक्के",
    sustainability: "स्थिरता",
    healthy: "स्वस्थ",
    weatherAlert: "मौसम चेतावनी",
    quickTip: "त्वरित सुझाव",
  },
  te: {
    welcome: "కృషిగ్రోకి స్వాగతం",
    getStarted: "ప్రారంభించండి",
    alreadyHaveAccount: "నాకు అకౌంట్ ఉంది",
    dashboard: "డాష్‌బోర్డ్",
    quests: "పనులు",
    community: "సమాజం",
    market: "మార్కెట్",
    profile: "ప్రొఫైల్",
    sustainableFarming: "సస్టైనబుల్ ఫార్మింగ్",
    virtualFarm: "నా వర్చువల్ ఫారం",
    todaysQuests: "నేటి పనులు",
    viewAll: "అన్నీ చూడండి",
    completeQuest: "నేను చేశాను!",
    level: "లెవల్",
    coins: "నాణేలు",
    sustainability: "స్థిరత్వం",
    healthy: "ఆరోగ్యకరమైన",
    weatherAlert: "వాతావరణ హెచ్చరిక",
    quickTip: "త్వరిత చిట్కా",
  },
  ta: {
    welcome: "கிருஷிக்ரோவுக்கு வரவேற்கிறோம்",
    getStarted: "தொடங்குங்கள்",
    alreadyHaveAccount: "எனக்கு கணக்கு உள்ளது",
    dashboard: "டாஷ்போர்டு",
    quests: "பணிகள்",
    community: "சமூகம்",
    market: "சந்தை",
    profile: "சுயவிவரம்",
    sustainableFarming: "நிலையான விவசாயம்",
    virtualFarm: "என் மெய்நிகர் பண்ணை",
    todaysQuests: "இன்றைய பணிகள்",
    viewAll: "அனைத்தும் பார்க்க",
    completeQuest: "நான் செய்தேன்!",
    level: "நிலை",
    coins: "நாணயங்கள்",
    sustainability: "நிலைத்தன்மை",
    healthy: "ஆரோக்கியமான",
    weatherAlert: "வானிலை எச்சரிக்கை",
    quickTip: "விரைவான குறிப்பு",
  }
};

export type LanguageCode = keyof typeof translations;

export function t(key: string, language: LanguageCode = 'hi'): string {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

export function speakText(text: string, language: LanguageCode = 'hi') {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    switch (language) {
      case 'hi':
        utterance.lang = 'hi-IN';
        break;
      case 'te':
        utterance.lang = 'te-IN';
        break;
      case 'ta':
        utterance.lang = 'ta-IN';
        break;
      default:
        utterance.lang = 'en-IN';
    }
    
    speechSynthesis.speak(utterance);
  }
}
