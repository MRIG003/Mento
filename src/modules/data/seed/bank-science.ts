/** Science demo bank for Classes 3-8 (Demo data). Two concepts per class, six questions each, English and Hindi. */
import { fill, mcq, type RawQuestion } from './q';

type Bi = [string, string];
const ch = (en: string, hi: string): Bi => [en, hi];

export const SCIENCE_CONCEPTS = [
  // Class 3
  { id: 'c_sc3_plants', grade: 3, chapter: ch('Plants and animals', 'पौधे और जानवर'), name: ch('Parts of a plant', 'पौधे के भाग') },
  { id: 'c_sc3_animals', grade: 3, chapter: ch('Plants and animals', 'पौधे और जानवर'), name: ch('Animals and their food', 'जानवर और उनका भोजन') },
  // Class 4
  { id: 'c_sc4_water', grade: 4, chapter: ch('Water and air', 'पानी और हवा'), name: ch('The water cycle', 'जल चक्र') },
  { id: 'c_sc4_air', grade: 4, chapter: ch('Water and air', 'पानी और हवा'), name: ch('Air around us', 'हमारे आसपास की हवा') },
  // Class 5
  { id: 'c_sc5_food', grade: 5, chapter: ch('Food and matter', 'भोजन और पदार्थ'), name: ch('Nutrients in food', 'भोजन में पोषक तत्व') },
  { id: 'c_sc5_matter', grade: 5, chapter: ch('Food and matter', 'भोजन और पदार्थ'), name: ch('Solids, liquids and gases', 'ठोस, द्रव और गैस') },
  // Class 6
  { id: 'c_sc6_sep', grade: 6, chapter: ch('Materials and light', 'पदार्थ और प्रकाश'), name: ch('Separating mixtures', 'मिश्रण अलग करना') },
  { id: 'c_sc6_light', grade: 6, chapter: ch('Materials and light', 'पदार्थ और प्रकाश'), name: ch('Light and shadows', 'प्रकाश और छायाएँ') },
  // Class 7
  { id: 'c_sc7_heat', grade: 7, chapter: ch('Heat and acids', 'ऊष्मा और अम्ल'), name: ch('Heat and temperature', 'ऊष्मा और तापमान') },
  { id: 'c_sc7_acid', grade: 7, chapter: ch('Heat and acids', 'ऊष्मा और अम्ल'), name: ch('Acids and bases', 'अम्ल और क्षारक') },
  // Class 8
  { id: 'c_sc8_cell', grade: 8, chapter: ch('Cells and forces', 'कोशिका और बल'), name: ch('Cells', 'कोशिकाएँ') },
  { id: 'c_sc8_force', grade: 8, chapter: ch('Cells and forces', 'कोशिका और बल'), name: ch('Force and pressure', 'बल और दाब') },
] as const;

export const SCIENCE_BANK: RawQuestion[] = [
  // ── Class 3: Parts of a plant ──
  mcq('q_s3p1', 'c_sc3_plants', 1, ['Which part of a plant takes in water from the soil?', 'पौधे का कौन-सा भाग मिट्टी से पानी लेता है?'], [['a', ['Leaves', 'पत्तियाँ'], ['Thinks leaves drink water from the soil', 'सोचते हैं कि पत्तियाँ मिट्टी से पानी पीती हैं']], ['b', ['Roots', 'जड़ें']], ['c', ['Flowers', 'फूल']]], 'b'),
  fill('q_s3p2', 'c_sc3_plants', 1, ['Which part of a plant makes food using sunlight?', 'पौधे का कौन-सा भाग धूप से भोजन बनाता है?'], 'leaves', ['leaf', 'पत्तियाँ', 'पत्तियां', 'पत्ती']),
  mcq('q_s3p3', 'c_sc3_plants', 1, ['What does the stem do?', 'तना क्या करता है?'], [['a', ['Makes seeds', 'बीज बनाता है']], ['b', ['Gives the plant its smell', 'पौधे को गंध देता है']], ['c', ['Holds the plant up and carries water', 'पौधे को सहारा देता है और पानी पहुँचाता है']]], 'c'),
  mcq('q_s3p4', 'c_sc3_plants', 2, ['Seeds are usually found inside the…', 'बीज आमतौर पर किसके अंदर होते हैं?'], [['a', ['Fruit', 'फल']], ['b', ['Root', 'जड़']], ['c', ['Leaf', 'पत्ती']]], 'a'),
  mcq('q_s3p5', 'c_sc3_plants', 2, ['Which part of a plant becomes a fruit?', 'पौधे का कौन-सा भाग फल बनता है?'], [['a', ['Stem', 'तना']], ['b', ['Flower', 'फूल']], ['c', ['Root', 'जड़']]], 'b'),
  fill('q_s3p6', 'c_sc3_plants', 3, ['A carrot is the ___ of the plant.', 'गाजर पौधे की ___ है।'], 'root', ['roots', 'जड़', 'जड़ें']),

  // ── Class 3: Animals and their food ──
  mcq('q_s3a1', 'c_sc3_animals', 1, ['Animals that eat only plants are called…', 'जो जानवर सिर्फ़ पौधे खाते हैं, उन्हें कहते हैं…'], [['a', ['Carnivores', 'माँसाहारी'], ['Mixes up plant-eaters and meat-eaters', 'शाकाहारी और माँसाहारी में गड़बड़ कर दी']], ['b', ['Omnivores', 'सर्वाहारी']], ['c', ['Herbivores', 'शाकाहारी']]], 'c'),
  mcq('q_s3a2', 'c_sc3_animals', 1, ['Which of these is a carnivore?', 'इनमें से माँसाहारी कौन है?'], [['a', ['Cow', 'गाय']], ['b', ['Lion', 'शेर']], ['c', ['Goat', 'बकरी']]], 'b'),
  mcq('q_s3a3', 'c_sc3_animals', 2, ['Which animal eats both plants and other animals?', 'कौन-सा जानवर पौधे और दूसरे जानवर, दोनों खाता है?'], [['a', ['Deer', 'हिरण']], ['b', ['Tiger', 'बाघ']], ['c', ['Bear', 'भालू']]], 'c'),
  fill('q_s3a4', 'c_sc3_animals', 1, ['Name one animal that lives in water.', 'पानी में रहने वाले किसी एक जानवर का नाम लिखें।'], 'fish', ['whale', 'dolphin', 'shark', 'turtle', 'crab', 'मछली', 'व्हेल', 'डॉल्फिन', 'कछुआ', 'केकड़ा']),
  mcq('q_s3a5', 'c_sc3_animals', 1, ['A bird lives in a…', 'पक्षी किसमें रहता है?'], [['a', ['Nest', 'घोंसला']], ['b', ['Burrow', 'बिल']], ['c', ['Den', 'माँद']]], 'a'),
  mcq('q_s3a6', 'c_sc3_animals', 3, ['Humans eat plants and animal foods, so humans are…', 'इंसान पौधों और जानवरों से मिला भोजन खाते हैं, इसलिए इंसान हैं…'], [['a', ['Herbivores', 'शाकाहारी']], ['b', ['Carnivores', 'माँसाहारी']], ['c', ['Omnivores', 'सर्वाहारी']]], 'c'),

  // ── Class 4: The water cycle ──
  mcq('q_s4w1', 'c_sc4_water', 1, ['Water turning into water vapour when heated is called…', 'गरम होने पर पानी का भाप बन जाना कहलाता है…'], [['a', ['Condensation', 'संघनन'], ['Mixes up evaporation and condensation', 'वाष्पन और संघनन में गड़बड़ कर दी']], ['b', ['Evaporation', 'वाष्पन']], ['c', ['Freezing', 'जमना']]], 'b'),
  mcq('q_s4w2', 'c_sc4_water', 2, ['Clouds form when water vapour…', 'बादल तब बनते हैं जब भाप…'], [['a', ['Melts', 'पिघलती है']], ['b', ['Burns', 'जलती है']], ['c', ['Cools into tiny droplets', 'ठंडी होकर छोटी बूँदें बन जाती है']]], 'c'),
  mcq('q_s4w3', 'c_sc4_water', 1, ['Which gives the heat that evaporates water from the sea?', 'समुद्र का पानी भाप बनने के लिए गर्मी कहाँ से मिलती है?'], [['a', ['The Sun', 'सूरज']], ['b', ['The Moon', 'चाँद']], ['c', ['The wind', 'हवा']]], 'a'),
  mcq('q_s4w4', 'c_sc4_water', 2, ['Water vapour changing back into liquid water is…', 'भाप का वापस पानी बन जाना कहलाता है…'], [['a', ['Evaporation', 'वाष्पन']], ['b', ['Condensation', 'संघनन']], ['c', ['Melting', 'पिघलना']]], 'b'),
  fill('q_s4w5', 'c_sc4_water', 1, ['Ice changing into water is called ___.', 'बर्फ़ का पानी बन जाना ___ कहलाता है।'], 'melting', ['melt', 'पिघलना', 'पिघलने']),
  mcq('q_s4w6', 'c_sc4_water', 3, ['Rainwater finally flows into…', 'बारिश का पानी आख़िर में कहाँ पहुँचता है?'], [['a', ['Rivers, lakes and the sea', 'नदियों, झीलों और समुद्र में']], ['b', ['Only the clouds', 'सिर्फ़ बादलों में']], ['c', ['Only mountains', 'सिर्फ़ पहाड़ों में']]], 'a'),

  // ── Class 4: Air around us ──
  mcq('q_s4r1', 'c_sc4_air', 1, ['Which gas do we need to breathe in to live?', 'जीने के लिए हमें कौन-सी गैस साँस में लेनी होती है?'], [['a', ['Nitrogen', 'नाइट्रोजन'], ['Thinks the most common gas in air is the one we breathe', 'सोचते हैं कि हवा में सबसे ज़्यादा जो गैस है वही हम साँस में लेते हैं']], ['b', ['Carbon dioxide', 'कार्बन डाइऑक्साइड']], ['c', ['Oxygen', 'ऑक्सीजन']]], 'c'),
  mcq('q_s4r2', 'c_sc4_air', 1, ['Which shows that air takes up space?', 'कौन-सी चीज़ दिखाती है कि हवा जगह घेरती है?'], [['a', ['A blown-up balloon', 'हवा भरा गुब्बारा']], ['b', ['A stone', 'पत्थर']], ['c', ['A glass of water', 'पानी का गिलास']]], 'a'),
  mcq('q_s4r3', 'c_sc4_air', 1, ['Air that is moving is called…', 'चलती हुई हवा को कहते हैं…'], [['a', ['Cloud', 'बादल']], ['b', ['Wind', 'पवन']], ['c', ['Smoke', 'धुआँ']]], 'b'),
  fill('q_s4r4', 'c_sc4_air', 2, ['Plants give out ___ in sunlight.', 'पौधे धूप में ___ छोड़ते हैं।'], 'oxygen', ['o2', 'ऑक्सीजन']),
  mcq('q_s4r5', 'c_sc4_air', 2, ['Does air have weight?', 'क्या हवा का वज़न होता है?'], [['a', ['No, air weighs nothing', 'नहीं, हवा का कोई वज़न नहीं होता'], ['Thinks air weighs nothing', 'सोचते हैं कि हवा का वज़न नहीं होता']], ['b', ['Yes, a small weight', 'हाँ, थोड़ा वज़न होता है']]], 'b'),
  mcq('q_s4r6', 'c_sc4_air', 1, ['Which of these needs air to burn?', 'इनमें से किसे जलने के लिए हवा चाहिए?'], [['a', ['Water', 'पानी']], ['b', ['A stone', 'पत्थर']], ['c', ['A candle', 'मोमबत्ती']]], 'c'),

  // ── Class 5: Nutrients in food ──
  mcq('q_s5f1', 'c_sc5_food', 1, ['Which nutrient helps build muscles?', 'कौन-सा पोषक तत्व माँसपेशियाँ बनाने में मदद करता है?'], [['a', ['Fats', 'वसा']], ['b', ['Vitamins', 'विटामिन']], ['c', ['Proteins', 'प्रोटीन']]], 'c'),
  mcq('q_s5f2', 'c_sc5_food', 1, ['Which food is rich in carbohydrates (energy)?', 'कौन-सा भोजन कार्बोहाइड्रेट (ऊर्जा) से भरपूर है?'], [['a', ['Rice', 'चावल']], ['b', ['Egg', 'अंडा']], ['c', ['Lemon', 'नींबू']]], 'a'),
  mcq('q_s5f3', 'c_sc5_food', 2, ['Which food is a good source of Vitamin C?', 'विटामिन C का अच्छा स्रोत कौन-सा है?'], [['a', ['Bread', 'ब्रेड']], ['b', ['Lemon', 'नींबू']], ['c', ['Butter', 'मक्खन']]], 'b'),
  fill('q_s5f4', 'c_sc5_food', 2, ['Calcium makes our ___ strong.', 'कैल्शियम हमारी ___ को मज़बूत बनाता है।'], 'bones', ['bone', 'teeth', 'हड्डियाँ', 'हड्डियां', 'हड्डी', 'दाँत']),
  mcq('q_s5f5', 'c_sc5_food', 1, ['A balanced diet means…', 'संतुलित आहार का मतलब है…'], [['a', ['Eating only sweet things', 'सिर्फ़ मीठी चीज़ें खाना']], ['b', ['Eating only protein', 'सिर्फ़ प्रोटीन खाना']], ['c', ['Eating a variety of foods in the right amounts', 'अलग-अलग भोजन सही मात्रा में खाना']]], 'c'),
  mcq('q_s5f6', 'c_sc5_food', 3, ['Which gives roughage (fibre) that helps digestion?', 'कौन-सा भोजन रेशा (फ़ाइबर) देता है जो पाचन में मदद करता है?'], [['a', ['Fruits and vegetables', 'फल और सब्ज़ियाँ']], ['b', ['Butter', 'मक्खन']], ['c', ['Sugar', 'चीनी']]], 'a'),

  // ── Class 5: Solids, liquids and gases ──
  mcq('q_s5m1', 'c_sc5_matter', 1, ['Which of these has a fixed shape?', 'इनमें से किसका आकार निश्चित होता है?'], [['a', ['Water', 'पानी']], ['b', ['A stone', 'पत्थर']], ['c', ['Air', 'हवा']]], 'b'),
  mcq('q_s5m2', 'c_sc5_matter', 1, ['A liquid takes the shape of…', 'द्रव किसका आकार ले लेता है?'], [['a', ['Its container', 'अपने बर्तन का']], ['b', ['A cube', 'घन का']], ['c', ['It never changes', 'कभी नहीं बदलता']]], 'a'),
  mcq('q_s5m3', 'c_sc5_matter', 2, ['Which state of matter spreads to fill the whole container?', 'पदार्थ की कौन-सी अवस्था पूरे बर्तन में फैल जाती है?'], [['a', ['Solid', 'ठोस']], ['b', ['Liquid', 'द्रव'], ['Thinks liquids also spread to fill all the space', 'सोचते हैं कि द्रव भी पूरी जगह में फैल जाता है']], ['c', ['Gas', 'गैस']]], 'c'),
  fill('q_s5m4', 'c_sc5_matter', 2, ['Water at 100°C turns into ___.', '100°C पर पानी ___ बन जाता है।'], 'steam', ['water vapour', 'vapour', 'vapor', 'भाप']),
  mcq('q_s5m5', 'c_sc5_matter', 1, ['Which of these is a gas?', 'इनमें से गैस कौन-सी है?'], [['a', ['Milk', 'दूध']], ['b', ['Iron', 'लोहा']], ['c', ['Oxygen', 'ऑक्सीजन']]], 'c'),
  mcq('q_s5m6', 'c_sc5_matter', 1, ['Ice is the ___ form of water.', 'बर्फ़ पानी का ___ रूप है।'], [['a', ['Solid', 'ठोस']], ['b', ['Liquid', 'द्रव']], ['c', ['Gas', 'गैस']]], 'a'),

  // ── Class 6: Separating mixtures ──
  mcq('q_s6s1', 'c_sc6_sep', 1, ['Which method separates sand from muddy water?', 'कीचड़ वाले पानी से रेत कैसे अलग की जाती है?'], [['a', ['Evaporation', 'वाष्पन']], ['b', ['Filtration', 'छानना']], ['c', ['Magnet', 'चुंबक']]], 'b'),
  mcq('q_s6s2', 'c_sc6_sep', 1, ['Salt is obtained from sea water by…', 'समुद्र के पानी से नमक कैसे मिलता है?'], [['a', ['Evaporation', 'वाष्पन']], ['b', ['Winnowing', 'फटकना']], ['c', ['Handpicking', 'हाथ से चुनना']]], 'a'),
  mcq('q_s6s3', 'c_sc6_sep', 2, ['Winnowing separates…', 'फटकना किसे अलग करता है?'], [['a', ['Iron from sand', 'रेत से लोहा']], ['b', ['Salt from water', 'पानी से नमक']], ['c', ['Light husk from heavier grain', 'हल्का भूसा भारी अनाज से']]], 'c'),
  fill('q_s6s4', 'c_sc6_sep', 2, ['A magnet can separate iron nails from sand because iron is ___.', 'चुंबक रेत से लोहे की कीलें अलग कर सकता है क्योंकि लोहा ___ है।'], 'magnetic', ['चुंबकीय', 'चुम्बकीय']),
  mcq('q_s6s5', 'c_sc6_sep', 1, ['Picking out stones from rice by hand is called…', 'चावल से कंकड़ हाथ से चुनना कहलाता है…'], [['a', ['Handpicking', 'हाथ से चुनना']], ['b', ['Filtration', 'छानना']], ['c', ['Evaporation', 'वाष्पन']]], 'a'),
  mcq('q_s6s6', 'c_sc6_sep', 3, ['Which of these is a mixture?', 'इनमें से मिश्रण कौन-सा है?'], [['a', ['Distilled water', 'आसुत जल']], ['b', ['Sea water', 'समुद्र का पानी']], ['c', ['Pure gold', 'शुद्ध सोना']]], 'b'),

  // ── Class 6: Light and shadows ──
  mcq('q_s6l1', 'c_sc6_light', 1, ['Which of these makes its own light?', 'इनमें से कौन अपना प्रकाश खुद बनाता है?'], [['a', ['The Moon', 'चाँद'], ['Thinks the Moon makes its own light', 'सोचते हैं कि चाँद अपनी रोशनी खुद बनाता है']], ['b', ['A mirror', 'दर्पण']], ['c', ['The Sun', 'सूरज']]], 'c'),
  mcq('q_s6l2', 'c_sc6_light', 1, ['Light travels in…', 'प्रकाश किस तरह चलता है?'], [['a', ['Straight lines', 'सीधी रेखाओं में']], ['b', ['Circles', 'गोलों में']], ['c', ['Zigzags', 'टेढ़े-मेढ़े रास्ते पर']]], 'a'),
  mcq('q_s6l3', 'c_sc6_light', 1, ['Which material is transparent?', 'कौन-सी वस्तु पारदर्शी है?'], [['a', ['Wood', 'लकड़ी']], ['b', ['Clear glass', 'साफ़ काँच']], ['c', ['Cardboard', 'गत्ता']]], 'b'),
  mcq('q_s6l4', 'c_sc6_light', 2, ['A shadow forms when light is…', 'छाया तब बनती है जब प्रकाश…'], [['a', ['Blocked by an opaque object', 'किसी अपारदर्शी वस्तु से रुक जाता है']], ['b', ['Passing through clear glass', 'साफ़ काँच से निकल जाता है']], ['c', ['Switched on', 'जला दिया जाता है']]], 'a'),
  fill('q_s6l5', 'c_sc6_light', 3, ['When an object moves closer to a lamp, its shadow gets bigger or smaller?', 'वस्तु को लैंप के पास लाने पर उसकी छाया बड़ी होती है या छोटी?'], 'bigger', ['larger', 'big', 'बड़ी', 'बड़ा']),
  mcq('q_s6l6', 'c_sc6_light', 2, ['Frosted glass lets some light pass but you cannot see clearly through it. It is…', 'धुँधला काँच कुछ प्रकाश निकलने देता है पर आर-पार साफ़ नहीं दिखता। यह है…'], [['a', ['Transparent', 'पारदर्शी']], ['b', ['Opaque', 'अपारदर्शी']], ['c', ['Translucent', 'पारभासी']]], 'c'),

  // ── Class 7: Heat and temperature ──
  mcq('q_s7h1', 'c_sc7_heat', 1, ['Which instrument measures temperature?', 'तापमान किस यंत्र से मापा जाता है?'], [['a', ['Thermometer', 'थर्मामीटर']], ['b', ['Barometer', 'बैरोमीटर']], ['c', ['Ammeter', 'ऐमीटर']]], 'a'),
  mcq('q_s7h2', 'c_sc7_heat', 1, ['The normal human body temperature is about…', 'इंसान के शरीर का सामान्य तापमान लगभग होता है…'], [['a', ['25°C', '25°C']], ['b', ['37°C', '37°C']], ['c', ['100°C', '100°C']]], 'b'),
  mcq('q_s7h3', 'c_sc7_heat', 2, ['A metal spoon in hot tea becomes hot. Heat travels by…', 'गरम चाय में रखा धातु का चम्मच गरम हो जाता है। ऊष्मा किस तरह पहुँचती है?'], [['a', ['Radiation', 'विकिरण'], ['Mixes up the three ways heat travels', 'ऊष्मा के तीन तरीकों में गड़बड़ कर दी']], ['b', ['Convection', 'संवहन']], ['c', ['Conduction', 'चालन']]], 'c'),
  mcq('q_s7h4', 'c_sc7_heat', 2, ['Heat from the Sun reaches the Earth by…', 'सूरज की गर्मी पृथ्वी तक कैसे पहुँचती है?'], [['a', ['Radiation', 'विकिरण']], ['b', ['Conduction', 'चालन']], ['c', ['Convection', 'संवहन']]], 'a'),
  fill('q_s7h5', 'c_sc7_heat', 1, ['Pure water boils at ___ °C at sea level.', 'समुद्र तल पर शुद्ध पानी ___ °C पर उबलता है।'], '100', ['100°C', '100 degrees', '100 डिग्री'], true),
  mcq('q_s7h6', 'c_sc7_heat', 3, ['Which is a good conductor of heat?', 'ऊष्मा का अच्छा चालक कौन-सा है?'], [['a', ['Wood', 'लकड़ी']], ['b', ['Plastic', 'प्लास्टिक']], ['c', ['Copper', 'ताँबा']]], 'c'),

  // ── Class 7: Acids and bases ──
  mcq('q_s7a1', 'c_sc7_acid', 1, ['Which of these is an acid?', 'इनमें से अम्ल कौन-सा है?'], [['a', ['Soap solution', 'साबुन का घोल']], ['b', ['Lemon juice', 'नींबू का रस']], ['c', ['Baking soda solution', 'बेकिंग सोडा का घोल']]], 'b'),
  mcq('q_s7a2', 'c_sc7_acid', 1, ['Blue litmus paper turns red in…', 'नीला लिटमस कागज़ किसमें लाल हो जाता है?'], [['a', ['An acid', 'अम्ल में']], ['b', ['A base', 'क्षारक में'], ['Mixes up which colour change shows an acid', 'अम्ल और क्षारक के रंग बदलने में गड़बड़ कर दी']], ['c', ['Pure water', 'शुद्ध पानी में']]], 'a'),
  mcq('q_s7a3', 'c_sc7_acid', 2, ['Which of these is a base?', 'इनमें से क्षारक कौन-सा है?'], [['a', ['Vinegar', 'सिरका']], ['b', ['Curd', 'दही']], ['c', ['Baking soda', 'बेकिंग सोडा']]], 'c'),
  fill('q_s7a4', 'c_sc7_acid', 3, ['An acid and a base react to form a salt and ___.', 'अम्ल और क्षारक मिलकर लवण और ___ बनाते हैं।'], 'water', ['पानी', 'जल']),
  mcq('q_s7a5', 'c_sc7_acid', 2, ['Which is used to treat acidity in the stomach?', 'पेट की अम्लता (एसिडिटी) में क्या लिया जाता है?'], [['a', ['Lemon juice', 'नींबू का रस']], ['b', ['An antacid (a base)', 'ऐंटासिड (एक क्षारक)']], ['c', ['Vinegar', 'सिरका']]], 'b'),
  mcq('q_s7a6', 'c_sc7_acid', 1, ['Red litmus paper turns blue in…', 'लाल लिटमस कागज़ किसमें नीला हो जाता है?'], [['a', ['An acid', 'अम्ल में']], ['b', ['Lemon juice', 'नींबू के रस में']], ['c', ['A base', 'क्षारक में']]], 'c'),

  // ── Class 8: Cells ──
  mcq('q_s8c1', 'c_sc8_cell', 1, ['The basic unit of life is the…', 'जीवन की मूल इकाई है…'], [['a', ['Cell', 'कोशिका']], ['b', ['Tissue', 'ऊतक']], ['c', ['Organ', 'अंग']]], 'a'),
  mcq('q_s8c2', 'c_sc8_cell', 1, ['Which part controls the activities of a cell?', 'कोशिका की गतिविधियों को कौन-सा भाग नियंत्रित करता है?'], [['a', ['Cell wall', 'कोशिका भित्ति']], ['b', ['Nucleus', 'केंद्रक']], ['c', ['Vacuole', 'रिक्तिका']]], 'b'),
  mcq('q_s8c3', 'c_sc8_cell', 2, ['Which is found in plant cells but not in animal cells?', 'कौन-सा भाग पादप कोशिका में होता है पर जंतु कोशिका में नहीं?'], [['a', ['Nucleus', 'केंद्रक'], ['Thinks only plant cells have a nucleus', 'सोचते हैं कि केंद्रक सिर्फ़ पादप कोशिका में होता है']], ['b', ['Cell membrane', 'कोशिका झिल्ली']], ['c', ['Cell wall', 'कोशिका भित्ति']]], 'c'),
  fill('q_s8c4', 'c_sc8_cell', 2, ['Who first saw cells in a slice of cork?', 'कॉर्क के टुकड़े में कोशिकाएँ सबसे पहले किसने देखीं?'], 'Robert Hooke', ['hooke', 'robert hook', 'हुक', 'रॉबर्ट हुक']),
  mcq('q_s8c5', 'c_sc8_cell', 3, ['Which part is called the powerhouse of the cell?', 'कोशिका का ऊर्जा-घर किसे कहते हैं?'], [['a', ['Mitochondria', 'माइटोकॉन्ड्रिया']], ['b', ['Nucleus', 'केंद्रक']], ['c', ['Chloroplast', 'हरितलवक']]], 'a'),
  mcq('q_s8c6', 'c_sc8_cell', 2, ['The green pigment that helps leaves make food is found in the…', 'पत्तियों में भोजन बनाने में मदद करने वाला हरा वर्णक किसमें होता है?'], [['a', ['Mitochondria', 'माइटोकॉन्ड्रिया']], ['b', ['Nucleus', 'केंद्रक']], ['c', ['Chloroplast', 'हरितलवक']]], 'c'),

  // ── Class 8: Force and pressure ──
  mcq('q_s8f1', 'c_sc8_force', 1, ['A force is a…', 'बल है एक…'], [['a', ['Push or a pull', 'धक्का या खिंचाव']], ['b', ['Kind of energy', 'तरह की ऊर्जा']], ['c', ['Speed', 'चाल']]], 'a'),
  mcq('q_s8f2', 'c_sc8_force', 1, ['The SI unit of force is the…', 'बल का SI मात्रक है…'], [['a', ['Joule', 'जूल']], ['b', ['Newton', 'न्यूटन']], ['c', ['Pascal', 'पास्कल']]], 'b'),
  mcq('q_s8f3', 'c_sc8_force', 2, ['Friction acts…', 'घर्षण बल कहाँ लगता है?'], [['a', ['In the direction of motion', 'गति की दिशा में'], ['Thinks friction helps the object keep moving', 'सोचते हैं कि घर्षण वस्तु को चलाने में मदद करता है']], ['b', ['Upwards only', 'सिर्फ़ ऊपर की ओर']], ['c', ['Opposite to the motion', 'गति की विपरीत दिशा में']]], 'c'),
  fill('q_s8f4', 'c_sc8_force', 2, ['Pressure = force divided by ___.', 'दाब = बल को ___ से भाग देना।'], 'area', ['क्षेत्रफल']),
  mcq('q_s8f5', 'c_sc8_force', 3, ['Why does a sharp knife cut better than a blunt one?', 'तेज़ चाकू कुंद चाकू से बेहतर क्यों काटता है?'], [['a', ['Smaller area, so more pressure', 'कम क्षेत्रफल, इसलिए ज़्यादा दाब']], ['b', ['Larger area, so more pressure', 'ज़्यादा क्षेत्रफल, इसलिए ज़्यादा दाब']], ['c', ['It is heavier', 'वह ज़्यादा भारी होता है']]], 'a'),
  mcq('q_s8f6', 'c_sc8_force', 1, ['Gravity pulls objects towards the…', 'गुरुत्वाकर्षण वस्तुओं को किसकी ओर खींचता है?'], [['a', ['Sky', 'आसमान']], ['b', ['Sun', 'सूरज']], ['c', ['Centre of the Earth', 'पृथ्वी के केंद्र']]], 'c'),
];
