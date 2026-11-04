/** Demo school, teachers, classes and rosters. All Demo data: first names only, no surnames, no contact details. */
export const SCHOOL = { id: 'sch_demo', name: 'Demo Public School', code: 'DEMO26', plan: 'free' as const };

export const TEACHERS = [
  { id: 't_demo', name: 'Meera', active: true },
  { id: 't_ravi', name: 'Ravi', active: true },
  { id: 't_farah', name: 'Farah', active: false },
  { id: 't_john', name: 'John', active: false },
] as const;

export const SUBJECTS = [
  { id: 'maths', name: { en: 'Maths', hi: 'गणित' } },
  { id: 'hindi', name: { en: 'Hindi', hi: 'हिन्दी' } },
  { id: 'science', name: { en: 'Science', hi: 'विज्ञान' } },
] as const;

/** The six who end up stuck on Comparing fractions come first; the rules decide that, the test checks it. */
const NAMES_6B = [
  'Anaya', 'Dev', 'Sana', 'Rohan', 'Tara', 'Vihaan', 'Aarav', 'Ishita', 'Kabir', 'Meher', 'Arjun', 'Diya', 'Kunal', 'Riya',
  'Yash', 'Zoya', 'Neel', 'Pari', 'Om', 'Aisha', 'Reyansh', 'Myra', 'Laksh', 'Navya', 'Shaurya', 'Kiara', 'Advik', 'Sara',
  'Vivaan', 'Anika', 'Ayaan', 'Ira', 'Krish', 'Avni', 'Rudra', 'Tanvi', 'Harsh', 'Nisha', 'Imran', 'Pooja',
];
const NAMES_6A = [
  'Aditya', 'Bhavna', 'Chirag', 'Divya', 'Esha', 'Farhan', 'Gauri', 'Hemant', 'Isha', 'Jatin', 'Kavya', 'Lalit', 'Mansi', 'Nikhil',
  'Ojas', 'Prachi', 'Rahul', 'Simran', 'Tushar', 'Urvi', 'Varun', 'Yamini', 'Zubin', 'Akash', 'Bina', 'Chetan', 'Disha', 'Eklavya',
  'Fatima', 'Gopal', 'Heena', 'Irfan', 'Juhi', 'Karan', 'Lata', 'Mohit',
];
const NAMES_5A = [
  'आरव', 'अनाया', 'कबीर', 'दिया', 'ईशान', 'गौरी', 'हर्ष', 'इरा', 'जय', 'काव्या', 'लक्ष्य', 'मीरा', 'नील', 'ओजस्वी', 'प्रिया',
  'रिया', 'साहिल', 'तन्वी', 'उदय', 'वाणी', 'यश', 'ज़ारा', 'अमन', 'भूमि', 'चिराग', 'दक्ष', 'एकता', 'फ़रहान', 'गुंजन', 'हीना',
];

const NAMES_7A = [
  'Aryan', 'Bhoomi', 'Charu', 'Deepak', 'Eshaan', 'Falguni', 'Girish', 'Hiral', 'Indra', 'Jiya', 'Kush', 'Lavanya', 'Manav', 'Nandini',
  'Omkar', 'Palak', 'Qasim', 'Ritika', 'Samar', 'Trisha', 'Utkarsh', 'Vidhi', 'Wasim', 'Xara', 'Yuvraj', 'Zeenat', 'Anvi', 'Bhavya',
  'Chaitanya', 'Dhriti', 'Ehsaan', 'Fiza',
];

export const CLASSES = [
  { id: 'cls_6b', teacherId: 't_demo', grade: 6, section: 'B', subjectId: 'maths', defaultLang: 'en' as const, names: NAMES_6B },
  { id: 'cls_6a', teacherId: 't_ravi', grade: 6, section: 'A', subjectId: 'maths', defaultLang: 'hi' as const, names: NAMES_6A },
  { id: 'cls_7a', teacherId: 't_demo', grade: 7, section: 'A', subjectId: 'science', defaultLang: 'en' as const, names: NAMES_7A },
  { id: 'cls_5a', teacherId: 't_farah', grade: 5, section: 'A', subjectId: 'hindi', defaultLang: 'hi' as const, names: NAMES_5A },
] as const;
