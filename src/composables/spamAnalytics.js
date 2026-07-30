// vue
import { computed, unref } from 'vue';

// utils
import { getCleanText } from 'src/utils/froalaHelper';

// constants
import { SPAM_DICTIONARY, SPAM_WEIGHTS } from 'src/utils/spamDictionary';

// --- UTILITY FUNCTIONS ---
/**
 * Creates a regex that:
 * 1. Escapes special chars ($, ?, etc.)
 * 2. Matches both standard spaces AND non-breaking spaces (&nbsp;)
 * 3. Only applies word boundaries (\b) if the phrase starts/ends with a letter/number
 */
const createSmartRegex = (phrase) => {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match any whitespace (space, tab, newline, nbsp)
  // This ensures "100% free" matches even if there is a newline between words
  const pattern = escaped.replace(/\s+/g, '[\\s\\u00A0]+');

  const startBoundary = /^\w/.test(phrase) ? '\\b' : '';
  const endBoundary = /\w$/.test(phrase) ? '\\b' : '';

  return new RegExp(`${startBoundary}${pattern}${endBoundary}`, 'gi');
};

export default function useEmailAnalytics(emailContentRef) {
  // --- FIXED TEXT EXTRACTION ---
  const getSeverityLabel = (weight) => {
    if (weight >= 5) {
      return {
        label: 'High',
        color: 'negative',
      };
    }
    if (weight >= 3) {
      return {
        label: 'Moderate',
        color: 'warning',
      };
    }
    return {
      label: 'Safe',
      color: 'positive',
    };
  };

  // computed
  const plainText = computed(() => getCleanText(unref(emailContentRef)));

  const wordCount = computed(() => {
    const text = plainText.value;
    // Split by any whitespace sequence
    return text.trim() ? text.trim().split(/[\s\u00A0]+/).length : 0;
  });

  const characterCount = computed(() => plainText.value.length);

  const readingTime = computed(() => {
    if (wordCount.value === 0) return '0 sec';
    const wordsPerMinute = 200;
    const minutes = wordCount.value / wordsPerMinute;
    const readMinutes = Math.floor(minutes);
    const readSeconds = Math.round((minutes - readMinutes) * 60);

    if (readMinutes > 0) {
      return `${readMinutes} min ${readSeconds} sec`;
    }
    return `${readSeconds} sec`;
  });

  const spamAnalysis = computed(() => {
    const textToScan = plainText.value;

    const foundSpam = [];
    let totalSeverityWeight = 0;

    Object.keys(SPAM_DICTIONARY).forEach((category) => {
      const phrasesMap = SPAM_DICTIONARY[category];
      const categoryWeight = SPAM_WEIGHTS[category] || 1;

      Object.keys(phrasesMap).forEach((phrase) => {
        const regex = createSmartRegex(phrase);
        const matches = textToScan.match(regex);

        if (matches) {
          foundSpam.push({
            word: phrase,
            category,
            categoryWeight,
            severity: getSeverityLabel(categoryWeight),
            count: matches.length,
            alternatives: phrasesMap[phrase],
          });

          totalSeverityWeight += (categoryWeight * matches.length);
        }
      });
    });

    return {
      totalSpamWords: foundSpam.length,
      totalSeverityScore: totalSeverityWeight,
      details: foundSpam,
    };
  });

  const spamScore = computed(() => {
    const totalWords = wordCount.value;
    const weightedScore = spamAnalysis.value.totalSeverityScore;

    if (totalWords === 0) return 0;

    const density = weightedScore / totalWords;
    const threshold = 0.15; // 15% density is considered "100% bad"

    const score = (density / threshold) * 100;
    return Math.min(Math.round(score), 100);
  });

  return {
    wordCount,
    characterCount,
    readingTime,
    spamAnalysis,
    spamScore,
  };
}
