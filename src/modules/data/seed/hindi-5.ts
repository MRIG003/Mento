/** Class 5 Hindi grammar demo sample (Demo data): संज्ञा, सर्वनाम, विशेषण. Answers are Hindi; English is for the teacher. */
import { fill, mcq, wrongTyped, type RawQuestion } from './q';

export const HINDI_5_CONCEPTS = [
  { id: 'c_hi_sangya', chapter: ['Grammar', 'व्याकरण'], name: ['Nouns (sangya)', 'संज्ञा'] },
  { id: 'c_hi_sarvanam', chapter: ['Grammar', 'व्याकरण'], name: ['Pronouns (sarvanam)', 'सर्वनाम'] },
  { id: 'c_hi_visheshan', chapter: ['Grammar', 'व्याकरण'], name: ['Adjectives (visheshan)', 'विशेषण'] },
] as const;

const VERB_AS_NOUN: [string, string] = ['Picks the action word instead of the naming word', 'नाम की जगह काम वाला शब्द चुना'];

export const HINDI_5_BANK: RawQuestion[] = [
  mcq('q_hs1', 'c_hi_sangya', 1, ['In "राम खेलता है", which word is the noun?', '"राम खेलता है" में संज्ञा कौन-सा शब्द है?'], [['a', 'राम'], ['b', 'खेलता', VERB_AS_NOUN], ['c', 'है']], 'a'),
  mcq('q_hs2', 'c_hi_sangya', 1, ['Which word is a noun?', 'इनमें से संज्ञा कौन-सा शब्द है?'], [['a', 'किताब'], ['b', 'सुंदर'], ['c', 'दौड़ना', VERB_AS_NOUN]], 'a'),
  fill('q_hs3', 'c_hi_sangya', 2, ['Write the noun in "दिल्ली बड़ा शहर है".', '"दिल्ली बड़ा शहर है" में से एक संज्ञा लिखें।'], 'दिल्ली', ['शहर', 'dilli', 'delhi']),
  mcq('q_hs4', 'c_hi_sangya', 2, ['"गंगा" is which kind of noun?', '"गंगा" कौन-सी संज्ञा है?'], [['a', 'व्यक्तिवाचक'], ['b', 'जातिवाचक', ['Mixes up proper and common nouns', 'व्यक्तिवाचक और जातिवाचक में गड़बड़ कर दी']], ['c', 'भाववाचक']], 'a'),
  fill('q_hs5', 'c_hi_sangya', 1, ['Name one animal (a noun).', 'किसी एक जानवर का नाम लिखें (संज्ञा)।'], 'गाय', ['कुत्ता', 'बिल्ली', 'शेर', 'हाथी', 'घोड़ा', 'बकरी', 'बंदर']),
  mcq('q_hs6', 'c_hi_sangya', 3, ['"मिठास" is which kind of noun?', '"मिठास" कौन-सी संज्ञा है?'], [['a', 'भाववाचक'], ['b', 'जातिवाचक'], ['c', 'व्यक्तिवाचक']], 'a'),

  mcq('q_hp1', 'c_hi_sarvanam', 1, ['Which word is a pronoun?', 'इनमें से सर्वनाम कौन-सा है?'], [['a', 'वह'], ['b', 'लड़का', ['Picks a noun instead of a pronoun', 'सर्वनाम की जगह संज्ञा चुनी']], ['c', 'खाना']], 'a'),
  fill('q_hp2', 'c_hi_sarvanam', 1, ['Fill in: ___ (वह/वे) सब खेल रहे हैं।', 'खाली जगह भरें: ___ (वह/वे) सब खेल रहे हैं।'], 'वे', ['ve']),
  mcq('q_hp3', 'c_hi_sarvanam', 2, ['"सीमा आई। ___ ने खाना खाया।" Which fits?', '"सीमा आई। ___ ने खाना खाया।" क्या आएगा?'], [['a', 'उस'], ['b', 'सीमा', ['Repeats the noun instead of a pronoun', 'सर्वनाम की जगह संज्ञा दोहराई']], ['c', 'मैं']], 'a'),
  fill('q_hp4', 'c_hi_sarvanam', 2, ['Write the pronoun for yourself.', 'अपने लिए कौन-सा सर्वनाम लगता है? लिखें।'], 'मैं', ['main', 'मै']),
  mcq('q_hp5', 'c_hi_sarvanam', 1, ['In "तुम कहाँ जा रहे हो?", the pronoun is…', '"तुम कहाँ जा रहे हो?" में सर्वनाम है…'], [['a', 'तुम'], ['b', 'कहाँ'], ['c', 'जा']], 'a'),
  mcq('q_hp6', 'c_hi_sarvanam', 3, ['"हम" is used for…', '"हम" का प्रयोग होता है…'], [['a', ['Many people including me', 'मेरे साथ कई लोगों के लिए']], ['b', ['Only one other person', 'सिर्फ़ किसी एक और के लिए']], ['c', ['A place', 'किसी जगह के लिए']]], 'a'),

  mcq('q_hv1', 'c_hi_visheshan', 1, ['In "लाल गुलाब", the adjective is…', '"लाल गुलाब" में विशेषण है…'], [['a', 'लाल'], ['b', 'गुलाब', ['Picks the noun instead of the describing word', 'विशेषण की जगह संज्ञा चुनी']]], 'a'),
  fill('q_hv2', 'c_hi_visheshan', 1, ['Write the adjective in "मीठा आम".', '"मीठा आम" में विशेषण लिखें।'], 'मीठा', ['meetha', 'mitha']),
  mcq('q_hv3', 'c_hi_visheshan', 2, ['Which word describes "बच्चा" in "होशियार बच्चा पढ़ता है"?', '"होशियार बच्चा पढ़ता है" में "बच्चा" की विशेषता बताने वाला शब्द?'], [['a', 'होशियार'], ['b', 'पढ़ता'], ['c', 'है']], 'a'),
  fill('q_hv4', 'c_hi_visheshan', 2, ['Write an adjective for "आसमान" (sky).', '"आसमान" के लिए एक विशेषण लिखें।'], 'नीला', ['साफ़', 'साफ', 'ऊँचा', 'ऊंचा', 'बड़ा', 'काला', 'सुंदर']),
  mcq('q_hv5', 'c_hi_visheshan', 1, ['Which is an adjective?', 'इनमें से विशेषण कौन-सा है?'], [['a', 'छोटा'], ['b', 'घर'], ['c', 'चलना']], 'a'),
  mcq('q_hv6', 'c_hi_visheshan', 3, ['In "पाँच केले", "पाँच" is which kind of adjective?', '"पाँच केले" में "पाँच" कौन-सा विशेषण है?'], [['a', 'संख्यावाचक'], ['b', 'गुणवाचक'], ['c', 'सार्वनामिक']], 'a'),
];

wrongTyped('q_hs3', 'बड़ा');
wrongTyped('q_hs5', 'खाना');
wrongTyped('q_hp2', 'वह');
wrongTyped('q_hp4', 'तुम');
wrongTyped('q_hv2', 'आम');
wrongTyped('q_hv4', 'उड़ना');
