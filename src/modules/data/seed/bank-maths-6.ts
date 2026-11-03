/** Class 6 Maths demo bank (Demo data). Fractions, decimals, basic geometry. Every concept ≥ 6 questions. */
import { fill, mcq, short, wrongTyped, type RawQuestion } from './q';

const SAME: [string, string] = ['Both are equal', 'दोनों बराबर हैं'];
const BIGGER_DEN: [string, string] = ['Thinks a bigger denominator means a bigger fraction', 'सोचते हैं कि बड़ा हर मतलब बड़ी भिन्न'];
const ADDS_DEN: [string, string] = ['Adds the denominators too', 'हर को भी जोड़ दिया'];

export const MATHS_6_CONCEPTS = [
  { id: 'c_frac_add', chapter: ['Fractions', 'भिन्न'], name: ['Adding fractions', 'भिन्नों का जोड़'] },
  { id: 'c_frac_equiv', chapter: ['Fractions', 'भिन्न'], name: ['Equivalent fractions', 'तुल्य भिन्न'] },
  { id: 'c_frac_compare', chapter: ['Fractions', 'भिन्न'], name: ['Comparing fractions', 'भिन्नों की तुलना'] },
  { id: 'c_dec_place', chapter: ['Decimals', 'दशमलव'], name: ['Place value in decimals', 'दशमलव में स्थानीय मान'] },
  { id: 'c_dec_compare', chapter: ['Decimals', 'दशमलव'], name: ['Comparing decimals', 'दशमलव की तुलना'] },
  { id: 'c_dec_add', chapter: ['Decimals', 'दशमलव'], name: ['Adding decimals', 'दशमलव का जोड़'] },
  { id: 'c_geo_angles', chapter: ['Basic geometry', 'मूल ज्यामिति'], name: ['Angles', 'कोण'] },
  { id: 'c_geo_triangles', chapter: ['Basic geometry', 'मूल ज्यामिति'], name: ['Triangles', 'त्रिभुज'] },
  { id: 'c_geo_perimeter', chapter: ['Basic geometry', 'मूल ज्यामिति'], name: ['Perimeter', 'परिमाप'] },
] as const;

export const MATHS_6_BANK: RawQuestion[] = [
  // ── Adding fractions ──
  mcq('q_fa1', 'c_frac_add', 1, ['1/5 + 2/5 = ?', '1/5 + 2/5 = ?'], [['a', '3/5'], ['b', '3/10', ADDS_DEN], ['c', '2/25']], 'a'),
  fill('q_fa2', 'c_frac_add', 1, ['2/7 + 3/7 = ? Write it as a fraction.', '2/7 + 3/7 = ? भिन्न में लिखें।'], '5/7'),
  mcq('q_fa3', 'c_frac_add', 2, ['1/2 + 1/4 = ?', '1/2 + 1/4 = ?'], [['a', '3/4'], ['b', '2/6', ['Adds the tops and the bottoms', 'ऊपर-ऊपर और नीचे-नीचे जोड़ दिया']], ['c', '1/6']], 'a'),
  short('q_fa4', 'c_frac_add', 2, ['How do you add 1/5 and 2/5? Explain in one line.', '1/5 और 2/5 को कैसे जोड़ते हैं? एक लाइन में समझाएँ।'], [
    [['add the numerators', 'अंश जोड़ते'], ['add the top numbers', 'add numerators', 'अंशों को जोड़ते', 'ऊपर की संख्या जोड़ते']],
    [['same denominator', 'हर वही रहता'], ['denominator stays the same', 'denominator stays', 'हर समान', 'हर नहीं बदलता', 'नीचे वाली संख्या वही']],
  ], 2),
  fill('q_fa5', 'c_frac_add', 3, ['3/8 + 2/8 + 1/8 = ?', '3/8 + 2/8 + 1/8 = ?'], '6/8', ['3/4']),
  mcq('q_fa6', 'c_frac_add', 1, ['Riya ate 2/6 of a cake and Sam ate 1/6. How much did they eat together?', 'रिया ने केक का 2/6 और सैम ने 1/6 खाया। दोनों ने मिलकर कितना खाया?'], [['a', '3/6'], ['b', '3/12', ADDS_DEN], ['c', '2/36']], 'a'),
  fill('q_fa7', 'c_frac_add', 1, ['1/9 + 4/9 = ?', '1/9 + 4/9 = ?'], '5/9'),

  // ── Equivalent fractions ──
  mcq('q_fe1', 'c_frac_equiv', 1, ['Which fraction is equal to 1/2?', 'कौन-सी भिन्न 1/2 के बराबर है?'], [['a', '2/4'], ['b', '1/4'], ['c', '2/3', ['Adds 1 to the top and the bottom', 'ऊपर और नीचे 1 जोड़ दिया']]], 'a'),
  fill('q_fe2', 'c_frac_equiv', 1, ['1/3 = ?/6', '1/3 = ?/6'], '2', ['two', 'दो'], true),
  mcq('q_fe3', 'c_frac_equiv', 2, ['Which one is NOT equal to 2/3?', 'कौन-सी भिन्न 2/3 के बराबर नहीं है?'], [['a', '4/6'], ['b', '6/9'], ['c', '3/4']], 'c'),
  fill('q_fe4', 'c_frac_equiv', 2, ['Write 6/8 in its simplest form.', '6/8 को सबसे सरल रूप में लिखें।'], '3/4'),
  mcq('q_fe5', 'c_frac_equiv', 3, ['3/5 = 12/?', '3/5 = 12/?'], [['a', '20'], ['b', '14', ['Adds instead of multiplying', 'गुणा करने की जगह जोड़ दिया']], ['c', '60']], 'a'),
  mcq('q_fe6', 'c_frac_equiv', 1, ['Is 2/4 equal to 1/2?', 'क्या 2/4, 1/2 के बराबर है?'], [['a', ['Yes', 'हाँ']], ['b', ['No', 'नहीं'], ['Thinks bigger numbers make a bigger fraction', 'सोचते हैं कि बड़ी संख्या मतलब बड़ी भिन्न']]], 'a'),
  fill('q_fe7', 'c_frac_equiv', 2, ['2/5 = 6/?', '2/5 = 6/?'], '15', [], true),

  // ── Comparing fractions ──
  mcq('q_fc1', 'c_frac_compare', 1, ['Which is bigger: 3/5 or 2/5?', 'कौन बड़ा है: 3/5 या 2/5?'], [['a', '3/5'], ['b', '2/5'], ['c', SAME]], 'a'),
  mcq('q_fc2', 'c_frac_compare', 1, ['Which is bigger: 1/3 or 1/5?', 'कौन बड़ा है: 1/3 या 1/5?'], [['a', '1/3'], ['b', '1/5', BIGGER_DEN], ['c', SAME]], 'a'),
  mcq('q_fc3', 'c_frac_compare', 2, ['Which is smaller: 2/3 or 3/4?', 'कौन छोटा है: 2/3 या 3/4?'], [['a', '2/3'], ['b', '3/4'], ['c', SAME]], 'a'),
  mcq('q_fc4', 'c_frac_compare', 2, ['Put in order from smallest: 1/2, 1/8, 1/4', 'सबसे छोटे से क्रम में लगाएँ: 1/2, 1/8, 1/4'], [['a', '1/8, 1/4, 1/2'], ['b', '1/2, 1/4, 1/8', BIGGER_DEN], ['c', '1/4, 1/8, 1/2']], 'a'),
  fill('q_fc5', 'c_frac_compare', 1, ['Fill in > or <: 4/7 ___ 6/7', '> या < भरें: 4/7 ___ 6/7'], '<', ['less', 'less than', 'कम', 'छोटा']),
  mcq('q_fc6', 'c_frac_compare', 3, ['Which is bigger: 5/6 or 7/8?', 'कौन बड़ा है: 5/6 या 7/8?'], [['a', '7/8'], ['b', '5/6'], ['c', SAME]], 'a'),
  fill('q_fc7', 'c_frac_compare', 2, ['Fill in > or <: 1/6 ___ 1/9', '> या < भरें: 1/6 ___ 1/9'], '>', ['greater', 'greater than', 'more', 'ज़्यादा', 'बड़ा']),
  mcq('q_fc8', 'c_frac_compare', 1, ['Which is bigger: 2/9 or 5/9?', 'कौन बड़ा है: 2/9 या 5/9?'], [['a', '5/9'], ['b', '2/9'], ['c', SAME]], 'a'),
  mcq('q_fc9', 'c_frac_compare', 2, ['Which is bigger: 1/2 or 1/10?', 'कौन बड़ा है: 1/2 या 1/10?'], [['a', '1/2'], ['b', '1/10', BIGGER_DEN], ['c', SAME]], 'a'),

  // ── Place value in decimals ──
  mcq('q_dp1', 'c_dec_place', 1, ['In 3.47, what is the place of 4?', '3.47 में 4 किस स्थान पर है?'], [['a', ['Tenths', 'दशांश']], ['b', ['Hundredths', 'शतांश']], ['c', ['Tens', 'दहाई'], ['Reads the decimal part like whole numbers', 'दशमलव वाले हिस्से को पूरी संख्या की तरह पढ़ा']]], 'a'),
  fill('q_dp2', 'c_dec_place', 1, ['Write 7 tenths as a decimal.', '7 दशांश को दशमलव में लिखें।'], '0.7', ['.7'], true),
  mcq('q_dp3', 'c_dec_place', 2, ['Which number has 5 in the hundredths place?', 'किस संख्या में 5 शतांश के स्थान पर है?'], [['a', '2.05'], ['b', '2.50'], ['c', '5.20']], 'a'),
  fill('q_dp4', 'c_dec_place', 2, ['Write 3 and 25 hundredths as a decimal.', '3 और 25 शतांश को दशमलव में लिखें।'], '3.25', [], true),
  mcq('q_dp5', 'c_dec_place', 1, ['0.5 is the same as…', '0.5 किसके बराबर है?'], [['a', '5/10'], ['b', '5/100'], ['c', '1/5']], 'a'),
  fill('q_dp6', 'c_dec_place', 3, ['Write 4/100 as a decimal.', '4/100 को दशमलव में लिखें।'], '0.04', ['.04'], true),

  // ── Comparing decimals ──
  mcq('q_dc1', 'c_dec_compare', 1, ['Which is bigger: 0.5 or 0.45?', 'कौन बड़ा है: 0.5 या 0.45?'], [['a', '0.5'], ['b', '0.45', ['Thinks a longer decimal is bigger', 'सोचते हैं कि लंबी दशमलव संख्या बड़ी होती है']], ['c', SAME]], 'a'),
  mcq('q_dc2', 'c_dec_compare', 1, ['Which is smaller: 1.2 or 1.09?', 'कौन छोटा है: 1.2 या 1.09?'], [['a', '1.09'], ['b', '1.2'], ['c', SAME]], 'a'),
  fill('q_dc3', 'c_dec_compare', 2, ['Fill in > or <: 0.3 ___ 0.25', '> या < भरें: 0.3 ___ 0.25'], '>', ['greater', 'ज़्यादा', 'बड़ा']),
  mcq('q_dc4', 'c_dec_compare', 2, ['Put in order from smallest: 0.7, 0.07, 0.17', 'सबसे छोटे से क्रम में लगाएँ: 0.7, 0.07, 0.17'], [['a', '0.07, 0.17, 0.7'], ['b', '0.7, 0.07, 0.17'], ['c', '0.17, 0.07, 0.7']], 'a'),
  mcq('q_dc5', 'c_dec_compare', 3, ['Is 0.60 equal to 0.6?', 'क्या 0.60, 0.6 के बराबर है?'], [['a', ['Yes', 'हाँ']], ['b', ['No', 'नहीं'], ['Thinks extra zeros change the value', 'सोचते हैं कि आख़िरी शून्य से मान बदल जाता है']]], 'a'),
  fill('q_dc6', 'c_dec_compare', 1, ['Fill in > or <: 2.4 ___ 2.9', '> या < भरें: 2.4 ___ 2.9'], '<', ['less', 'कम', 'छोटा']),

  // ── Adding decimals ──
  fill('q_da1', 'c_dec_add', 1, ['0.4 + 0.3 = ?', '0.4 + 0.3 = ?'], '0.7', ['.7'], true),
  mcq('q_da2', 'c_dec_add', 1, ['1.5 + 2.4 = ?', '1.5 + 2.4 = ?'], [['a', '3.9'], ['b', '3.09'], ['c', '39']], 'a'),
  fill('q_da3', 'c_dec_add', 2, ['2.75 + 1.5 = ?', '2.75 + 1.5 = ?'], '4.25', [], true),
  mcq('q_da4', 'c_dec_add', 2, ['0.6 + 0.08 = ?', '0.6 + 0.08 = ?'], [['a', '0.68'], ['b', '0.14', ['Lines up the last digits instead of the decimal points', 'दशमलव की जगह आख़िरी अंक मिलाकर जोड़ा']], ['c', '1.4']], 'a'),
  fill('q_da5', 'c_dec_add', 3, ['A pen costs ₹12.50 and a book ₹35.75. Total?', 'पेन ₹12.50 का और किताब ₹35.75 की है। कुल कितना?'], '48.25', ['₹48.25'], true),
  mcq('q_da6', 'c_dec_add', 1, ['0.2 + 0.2 + 0.2 = ?', '0.2 + 0.2 + 0.2 = ?'], [['a', '0.6'], ['b', '0.06'], ['c', '6']], 'a'),

  // ── Angles ──
  mcq('q_ga1', 'c_geo_angles', 1, ['An angle smaller than a right angle is…', 'समकोण से छोटा कोण कहलाता है…'], [['a', ['Acute', 'न्यून कोण']], ['b', ['Obtuse', 'अधिक कोण']], ['c', ['Straight', 'सरल कोण']]], 'a'),
  fill('q_ga2', 'c_geo_angles', 1, ['How many degrees is a right angle?', 'समकोण कितने डिग्री का होता है?'], '90', ['90°', '90 degrees', '90 डिग्री'], true),
  mcq('q_ga3', 'c_geo_angles', 2, ['An angle of 120° is…', '120° का कोण होता है…'], [['a', ['Obtuse', 'अधिक कोण']], ['b', ['Acute', 'न्यून कोण']], ['c', ['Right', 'समकोण']]], 'a'),
  fill('q_ga4', 'c_geo_angles', 2, ['How many degrees is a straight angle?', 'सरल कोण कितने डिग्री का होता है?'], '180', ['180°', '180 degrees', '180 डिग्री'], true),
  mcq('q_ga5', 'c_geo_angles', 1, ['The hands of a clock at 3 o’clock make…', '3 बजे घड़ी की सुइयाँ बनाती हैं…'], [['a', ['A right angle', 'समकोण']], ['b', ['An acute angle', 'न्यून कोण']], ['c', ['A straight angle', 'सरल कोण']]], 'a'),
  fill('q_ga6', 'c_geo_angles', 3, ['Two angles make a straight line. One is 70°. The other is?', 'दो कोण मिलकर सीधी रेखा बनाते हैं। एक 70° है। दूसरा?'], '110', ['110°'], true),

  // ── Triangles ──
  mcq('q_gt1', 'c_geo_triangles', 1, ['A triangle with all sides equal is…', 'जिस त्रिभुज की सभी भुजाएँ बराबर हों, वह है…'], [['a', ['Equilateral', 'समबाहु']], ['b', ['Isosceles', 'समद्विबाहु']], ['c', ['Scalene', 'विषमबाहु']]], 'a'),
  fill('q_gt2', 'c_geo_triangles', 1, ['How many sides does a triangle have?', 'त्रिभुज की कितनी भुजाएँ होती हैं?'], '3', ['three', 'तीन'], true),
  mcq('q_gt3', 'c_geo_triangles', 2, ['The angles of a triangle add up to…', 'त्रिभुज के कोणों का जोड़ होता है…'], [['a', '180°'], ['b', '360°', ['Mixes up triangles and quadrilaterals', 'त्रिभुज और चतुर्भुज में गड़बड़ कर दी']], ['c', '90°']], 'a'),
  fill('q_gt4', 'c_geo_triangles', 2, ['Two angles of a triangle are 60° and 70°. The third is?', 'त्रिभुज के दो कोण 60° और 70° हैं। तीसरा?'], '50', ['50°'], true),
  mcq('q_gt5', 'c_geo_triangles', 1, ['A triangle with one right angle is…', 'जिस त्रिभुज में एक समकोण हो, वह है…'], [['a', ['Right-angled', 'समकोण त्रिभुज']], ['b', ['Obtuse-angled', 'अधिक कोण त्रिभुज']], ['c', ['Equilateral', 'समबाहु']]], 'a'),
  mcq('q_gt6', 'c_geo_triangles', 3, ['Can a triangle have two right angles?', 'क्या किसी त्रिभुज में दो समकोण हो सकते हैं?'], [['a', ['No', 'नहीं']], ['b', ['Yes', 'हाँ']]], 'a'),

  // ── Perimeter ──
  fill('q_gp1', 'c_geo_perimeter', 1, ['A square has sides of 4 cm. Its perimeter?', 'वर्ग की भुजा 4 cm है। परिमाप?'], '16', ['16 cm', '16cm'], true),
  mcq('q_gp2', 'c_geo_perimeter', 1, ['Perimeter means…', 'परिमाप का मतलब है…'], [['a', ['The distance around a shape', 'आकृति के चारों ओर की दूरी']], ['b', ['The space inside a shape', 'आकृति के अंदर की जगह'], ['Mixes up perimeter and area', 'परिमाप और क्षेत्रफल में गड़बड़ कर दी']], ['c', ['The longest side', 'सबसे लंबी भुजा']]], 'a'),
  fill('q_gp3', 'c_geo_perimeter', 2, ['A rectangle is 5 cm long and 3 cm wide. Perimeter?', 'आयत 5 cm लंबा और 3 cm चौड़ा है। परिमाप?'], '16', ['16 cm', '16cm'], true),
  mcq('q_gp4', 'c_geo_perimeter', 2, ['A triangle has sides 3 cm, 4 cm and 5 cm. Perimeter?', 'त्रिभुज की भुजाएँ 3 cm, 4 cm और 5 cm हैं। परिमाप?'], [['a', '12 cm'], ['b', '60 cm', ['Multiplies the sides', 'भुजाओं का गुणा कर दिया']], ['c', '9 cm']], 'a'),
  fill('q_gp5', 'c_geo_perimeter', 3, ['A square has a perimeter of 36 cm. One side is?', 'वर्ग का परिमाप 36 cm है। एक भुजा?'], '9', ['9 cm', '9cm'], true),
  mcq('q_gp6', 'c_geo_perimeter', 1, ['Which has the bigger perimeter: a 2 cm square or a 3 cm square?', 'किसका परिमाप बड़ा है: 2 cm वाला वर्ग या 3 cm वाला?'], [['a', ['The 3 cm square', '3 cm वाला वर्ग']], ['b', ['The 2 cm square', '2 cm वाला वर्ग']], ['c', SAME]], 'a'),
];

wrongTyped('q_fa2', '5/14');
wrongTyped('q_fa5', '6/24');
wrongTyped('q_fa7', '5/18');
wrongTyped('q_fe2', '4');
wrongTyped('q_fe4', '6/8');
wrongTyped('q_fe7', '9');
wrongTyped('q_fc5', '>');
wrongTyped('q_fc7', '<');
wrongTyped('q_dp2', '0.07');
wrongTyped('q_dp4', '3.025');
wrongTyped('q_dp6', '0.4');
wrongTyped('q_dc3', '<');
wrongTyped('q_dc6', '>');
wrongTyped('q_da1', '0.07');
wrongTyped('q_da3', '3.90');
wrongTyped('q_da5', '47.25');
wrongTyped('q_ga2', '180');
wrongTyped('q_ga4', '90');
wrongTyped('q_ga6', '290');
wrongTyped('q_gt2', '4');
wrongTyped('q_gt4', '230');
wrongTyped('q_gp1', '8');
wrongTyped('q_gp3', '15');
wrongTyped('q_gp5', '6');
