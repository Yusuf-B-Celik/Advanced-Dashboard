export interface GrammarExample {
  en: string;
  tr: string;
  type?: 'positive' | 'negative' | 'question' | 'note';
}

export const GRAMMAR_LEVELS = [
  { id: 'all', label: 'Tüm Seviyeler', desc: 'A1 - C2 Kapsamlı' },
  { id: 'A1-A2', label: 'A1 - A2 Başlangıç & Temel', desc: 'Beginner & Elementary' },
  { id: 'B1-B2', label: 'B1 - B2 Orta & Üst-Orta', desc: 'Intermediate & Upper' },
  { id: 'C1-C2', label: 'C1 - C2 İleri & Ustalık', desc: 'Advanced & Mastery' }
];

export interface GrammarMistake {
  wrong: string;
  correct: string;
  explanation: string;
}

export interface GrammarQuickQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GrammarTopic {
  id: string;
  level: 'A1-A2' | 'B1-B2' | 'C1-C2';
  category: string;
  title: string;
  titleTr: string;
  summaryTr: string;
  formula: string;
  detailedRulesTr: string[];
  examples: GrammarExample[];
  commonMistakes: GrammarMistake[];
  quickCheck: GrammarQuickQuestion[];
}

export const ENGLISH_GRAMMAR_TOPICS: GrammarTopic[] = [
  // A1-A2 Level
  {
    id: 'to-be',
    level: 'A1-A2',
    category: 'Temel Yapılar',
    title: 'To Be (Am / Is / Are / Was / Were)',
    titleTr: 'Olmak Fiili (To Be)',
    summaryTr: 'İngilizcenin en temel yapı taşıdır. Durum, kimlik, yaş, milliyet ve mekan belirtmek için kullanılır.',
    formula: '(+) S + am/is/are + Noun/Adj | (-) S + am/is/are + not | (?) Am/Is/Are + S...?',
    detailedRulesTr: [
      'I öznesi için "am", he/she/it veya tekil özneler için "is", we/you/they veya çoğul özneler için "are" kullanılır.',
      'Geçmiş zamanda (Past Simple) I/he/she/it için "was", you/we/they için "were" kullanılır.',
      'Eylem/fiil içermez; sadece durum (state) veya sıfat/isim niteler.'
    ],
    examples: [
      { en: 'I am a software engineer.', tr: 'Ben bir yazılım mühendisiyim.', type: 'positive' },
      { en: 'She is not at home right now.', tr: 'O şu anda evde değil.', type: 'negative' },
      { en: 'Are you ready for the meeting?', tr: 'Toplantı için hazır mısın?', type: 'question' },
      { en: 'They were in London last summer.', tr: 'Onlar geçen yaz Londra\'daydılar.', type: 'positive' }
    ],
    commonMistakes: [
      {
        wrong: 'I am agree with you.',
        correct: 'I agree with you.',
        explanation: '"Agree" zaten bir fiildir, to be fiiliyle birleştirilmez.'
      },
      {
        wrong: 'He are my friend.',
        correct: 'He is my friend.',
        explanation: '"He" üçüncü tekil şahıs olduğu için "is" almalıdır.'
      }
    ],
    quickCheck: [
      {
        id: 'qc-tb-1',
        question: 'Sarah and Tom _____ very excited about the trip.',
        options: ['is', 'are', 'am', 'was'],
        correctAnswer: 'are',
        explanation: '"Sarah and Tom" çoğul (they) olduğu için "are" kullanılır.'
      },
      {
        id: 'qc-tb-2',
        question: '_____ you at the office yesterday afternoon?',
        options: ['Was', 'Were', 'Are', 'Is'],
        correctAnswer: 'Were',
        explanation: 'Geçmiş zaman (yesterday) ve "you" öznesi için "Were" kullanılır.'
      }
    ]
  },
  {
    id: 'present-simple',
    level: 'A1-A2',
    category: 'Zamanlar (Tenses)',
    title: 'Present Simple Tense',
    titleTr: 'Geniş Zaman',
    summaryTr: 'Alışkanlıklar, rutinler, genel geçer doğrular ve değişmeyen durumlar için kullanılır.',
    formula: '(+) S + V1 (he/she/it -> V+s/es) | (-) S + do/does not + V1 | (?) Do/Does + S + V1...?',
    detailedRulesTr: [
      'He, She, It ve tekil öznelerde olumlu cümlede fiile -s, -es veya -ies takısı gelir (He plays, She watches).',
      'Olumsuz ve soru cümlelerinde yardımcı fiil (do/does) geldiği için fiil daima yalın (V1) hale döner.',
      'Sıklık zarfları (always, usually, often, sometimes, never) genellikle özneden hemen sonra, yardımcı fiilden önce gelir.'
    ],
    examples: [
      { en: 'I drink green tea every morning.', tr: 'Her sabah yeşil çay içerim.', type: 'positive' },
      { en: 'He does not like waking up early.', tr: 'O erken uyanmayı sevmez.', type: 'negative' },
      { en: 'Where do your parents live?', tr: 'Ailen nerede yaşıyor?', type: 'question' },
      { en: 'Water boils at 100 degrees Celsius.', tr: 'Su 100 santigrat derecede kaynar.', type: 'positive' }
    ],
    commonMistakes: [
      {
        wrong: 'She doesn\'t likes apples.',
        correct: 'She doesn\'t like apples.',
        explanation: '"Doesn\'t" yardımcı fiili olduğu için esas fiil -s takısı almaz.'
      },
      {
        wrong: 'He live in Ankara.',
        correct: 'He lives in Ankara.',
        explanation: 'He/She/It öznelerinde olumlu cümlede fiil -s/-es takısı alır.'
      }
    ],
    quickCheck: [
      {
        id: 'qc-ps-1',
        question: 'My brother _____ guitar in a local band every weekend.',
        options: ['play', 'plays', 'playing', 'played'],
        correctAnswer: 'plays',
        explanation: '"My brother" (he) tekil özne olduğu için "plays" doğru cevaptır.'
      },
      {
        id: 'qc-ps-2',
        question: '_____ they work on Saturdays?',
        options: ['Does', 'Do', 'Are', 'Is'],
        correctAnswer: 'Do',
        explanation: '"They" öznesi ile geniş zamanda soru sormak için "Do" kullanılır.'
      }
    ]
  },
  {
    id: 'present-continuous',
    level: 'A1-A2',
    category: 'Zamanlar (Tenses)',
    title: 'Present Continuous Tense',
    titleTr: 'Şimdiki Zaman',
    summaryTr: 'Şu anda gerçekleşen olayları veya geçici durumları anlatmak için kullanılır.',
    formula: '(+) S + am/is/are + V-ing | (-) S + am/is/are + not + V-ing | (?) Am/Is/Are + S + V-ing...?',
    detailedRulesTr: [
      'Konuşma anında olan eylemleri anlatır (now, right now, at the moment).',
      'Geçici durumları ve bu aralar gerçekleşen olayları anlatır (these days, this week).',
      'Durum bildiren (Stative Verbs) fiiller (know, like, want, understand, believe) genellikle -ing takısı almaz.'
    ],
    examples: [
      { en: 'I am coding a new dashboard feature right now.', tr: 'Şu anda yeni bir dashboard özelliği kodluyorum.', type: 'positive' },
      { en: 'They are not studying, they are playing video games.', tr: 'Ders çalışmıyorlar, video oyunu oynuyorlar.', type: 'negative' },
      { en: 'Why are you looking at me like that?', tr: 'Neden bana öyle bakıyorsun?', type: 'question' }
    ],
    commonMistakes: [
      {
        wrong: 'I am knowing the answer.',
        correct: 'I know the answer.',
        explanation: '"Know" durum fiilidir (stative verb), sürekli zamanla (-ing) kullanılmaz.'
      },
      {
        wrong: 'Look! It rains.',
        correct: 'Look! It is raining.',
        explanation: 'Şu anda gerçekleşen bir eylem için Present Continuous kullanılır.'
      }
    ],
    quickCheck: [
      {
        id: 'qc-pc-1',
        question: 'Listen! Someone _____ the piano upstairs.',
        options: ['plays', 'is playing', 'play', 'are playing'],
        correctAnswer: 'is playing',
        explanation: '"Listen!" ifadesi olayın şu an gerçekleştiğini belirtir.'
      }
    ]
  },
  {
    id: 'past-simple',
    level: 'A1-A2',
    category: 'Zamanlar (Tenses)',
    title: 'Past Simple Tense',
    titleTr: 'Geçmiş Zaman',
    summaryTr: 'Geçmişte belirli bir zamanda başlayıp tamamlanmış olaylar için kullanılır.',
    formula: '(+) S + V2 (ed / irregular) | (-) S + did not + V1 | (?) Did + S + V1...?',
    detailedRulesTr: [
      'Düzenli fiiller (Regular verbs) sonuna -ed alır (walk -> walked, work -> worked).',
      'Düzensiz fiiller (Irregular verbs) tamamen değişir (go -> went, buy -> bought, see -> saw).',
      'Olumsuz ve soru cümlelerinde "did" yardımcı fiili geldiğinde esas fiil V1 (yalın) haline döner.'
    ],
    examples: [
      { en: 'We visited Rome two years ago.', tr: 'İki yıl önce Roma\'yı ziyaret ettik.', type: 'positive' },
      { en: 'I did not receive your email yesterday.', tr: 'Dün e-postanızı almadım.', type: 'negative' },
      { en: 'Did you finish the homework on time?', tr: 'Ödevi zamanında bitirdin mi?', type: 'question' }
    ],
    commonMistakes: [
      {
        wrong: 'I didn\'t went to school yesterday.',
        correct: 'I didn\'t go to school yesterday.',
        explanation: '"Didn\'t" sonrasında fiil 2. halde değil, 1. (yalın) halde kullanılır.'
      }
    ],
    quickCheck: [
      {
        id: 'qc-past-1',
        question: 'She _____ a new car last month.',
        options: ['buy', 'buys', 'bought', 'buying'],
        correctAnswer: 'bought',
        explanation: '"Last month" geçmiş zaman zarfıdır; buy fiilinin V2 hali "bought"tur.'
      }
    ]
  },

  // B1-B2 Level
  {
    id: 'present-perfect',
    level: 'B1-B2',
    category: 'Zamanlar (Tenses)',
    title: 'Present Perfect Tense',
    titleTr: 'Yakın Geçmiş / Etkisi Süren Zaman',
    summaryTr: 'Geçmişte olmuş ancak zamanı belirtilmemiş ya da etkisi ve sonucu günümüzde devam eden olayları anlatır.',
    formula: '(+) S + have/has + V3 (Past Participle) | (-) S + have/has not + V3 | (?) Have/Has + S + V3...?',
    detailedRulesTr: [
      'I, You, We, They için "have", He, She, It için "has" yardımcı fiili ve fiilin 3. hali (V3) kullanılır.',
      'Sık kullanılan anahtar kelimeler: already, yet, just, ever, never, since, for, recently, so far.',
      '"Since" bir başlangıç noktasını (Since 2018), "for" ise geçen zaman süresini (For 5 years) belirtir.',
      'Net bir geçmiş zaman ifadesi varsa (yesterday, in 2020, 2 days ago) Present Perfect değil Past Simple kullanılır.'
    ],
    examples: [
      { en: 'I have already finished my project.', tr: 'Projemi şimdiden bitirdim.', type: 'positive' },
      { en: 'She has lived in Berlin since 2021.', tr: 'O 2021\'den beri Berlin\'de yaşıyor.', type: 'positive' },
      { en: 'Have you ever visited Japan?', tr: 'Hiç Japonya\'yı ziyaret ettin mi?', type: 'question' },
      { en: 'They have not replied to my message yet.', tr: 'Henüz mesajıma cevap vermediler.', type: 'negative' }
    ],
    commonMistakes: [
      {
        wrong: 'I have seen him yesterday.',
        correct: 'I saw him yesterday.',
        explanation: 'Belirli geçmiş zaman zarfı ("yesterday") ile Present Perfect kullanılmaz, Past Simple kullanılır.'
      },
      {
        wrong: 'She has worked here since 3 years.',
        correct: 'She has worked here for 3 years.',
        explanation: 'Süre belirtirken "for", başlangıç noktası belirtirken "since" kullanılır.'
      }
    ],
    quickCheck: [
      {
        id: 'qc-pp-1',
        question: 'I haven\'t seen Michael _____ last Monday.',
        options: ['for', 'since', 'already', 'ago'],
        correctAnswer: 'since',
        explanation: '"Last Monday" kesin bir başlangıç noktası olduğu için "since" kullanılır.'
      },
      {
        id: 'qc-pp-2',
        question: 'Have you _____ the latest Marvel movie yet?',
        options: ['saw', 'see', 'seen', 'seeing'],
        correctAnswer: 'seen',
        explanation: 'Present Perfect soru yapısında fiilin 3. hali (seen) kullanılır.'
      }
    ]
  },
  {
    id: 'conditionals-b1b2',
    level: 'B1-B2',
    category: 'Koşul Cümleleri',
    title: 'Conditionals (Type 0, 1, 2, 3 & Mixed)',
    titleTr: 'Koşul Cümleleri (If Clauses)',
    summaryTr: 'Olasılıklar, varsayımlar, hayaller ve geçmiş pişmanlıkları ifade eden şart cümleleridir.',
    formula: 'Type 1: If + Present Simple, will + V1 | Type 2: If + Past Simple, would + V1 | Type 3: If + Past Perfect, would have + V3',
    detailedRulesTr: [
      'Type 0 (Genel Doğrular): If + Present Simple, Present Simple (If you heat ice, it melts).',
      'Type 1 (Gerçekçi Gelecek Olasılığı): If it rains, we will stay at home.',
      'Type 2 (Şu anki hayal/gerçekdışı durum): If I had a million dollars, I would travel the world.',
      'Type 3 (Geçmişteki pişmanlık/değişemez durum): If she had studied harder, she would have passed the exam.'
    ],
    examples: [
      { en: 'If you work hard, you will achieve your dreams.', tr: 'Eğer çok çalışırsan hayallerine ulaşırsın. (Type 1)', type: 'positive' },
      { en: 'If I were you, I would take that opportunity.', tr: 'Senin yerinde olsaydım o fırsatı değerlendirirdim. (Type 2)', type: 'positive' },
      { en: 'If we had left earlier, we wouldn\'t have missed the flight.', tr: 'Daha erken çıksaydık uçağı kaçırmazdık. (Type 3)', type: 'negative' }
    ],
    commonMistakes: [
      {
        wrong: 'If I will see him, I will tell him.',
        correct: 'If I see him, I will tell him.',
        explanation: 'If cümleciği (şart kısmı) içine "will" gelmez; geniş zaman kullanılır.'
      }
    ],
    quickCheck: [
      {
        id: 'qc-cond-1',
        question: 'If I _____ more free time, I would learn Spanish.',
        options: ['have', 'had', 'will have', 'would have'],
        correctAnswer: 'had',
        explanation: 'Type 2 koşul cümlesinde If kısmı Past Simple (had) alır.'
      }
    ]
  },
  {
    id: 'passive-voice',
    level: 'B1-B2',
    category: 'Cümle Yapıları',
    title: 'Passive Voice (Edilgen Çatı)',
    titleTr: 'Edilgen Çatı (Passive Voice)',
    summaryTr: 'Eylemi yapanın değil, eylemden etkilenen nesnenin veya eylemin kendisinin vurgulandığı yapıdır.',
    formula: 'Subject + be (am/is/are/was/were/been) + V3 (Past Participle) + (by agent)',
    detailedRulesTr: [
      'Nesne cümlenin başına özne olarak geçer.',
      'Zamana uygun "to be" formu getirilir ve esas fiilin 3. hali (V3) eklenir.',
      'Eğer eylemi kimin yaptığı belirtilmek isteniyorsa cümlenin sonuna "by ..." eklenir.'
    ],
    examples: [
      { en: 'The new bridge was built in 2023.', tr: 'Yeni köprü 2023 yılında inşa edildi.', type: 'positive' },
      { en: 'English is spoken all over the world.', tr: 'İngilizce tüm dünyada konuşulur.', type: 'positive' },
      { en: 'The report has been completed by the team.', tr: 'Rapor ekip tarafından tamamlandı.', type: 'positive' }
    ],
    commonMistakes: [
      {
        wrong: 'The car was repair yesterday.',
        correct: 'The car was repaired yesterday.',
        explanation: 'Passive yapıda fiil mutlaka 3. halde (V3) olmalıdır.'
      }
    ],
    quickCheck: [
      {
        id: 'qc-pass-1',
        question: 'The email _____ to all employees yesterday morning.',
        options: ['is sent', 'was sent', 'sent', 'was send'],
        correctAnswer: 'was sent',
        explanation: 'Geçmiş zaman (yesterday) ve tekil özne için "was sent" (be + V3) kullanılır.'
      }
    ]
  },

  // C1-C2 Level
  {
    id: 'inversion',
    level: 'C1-C2',
    category: 'İleri Yapılar & Retorik',
    title: 'Inversion (Devrik Cümle Yapısı)',
    titleTr: 'Devrik Cümleler (Inversion)',
    summaryTr: 'Vurguyu artırmak, edebi veya resmi bir üslup yakalamak için olumsuz/kısıtlayıcı zarfların cümlenin başına getirilmesiyle kurulur.',
    formula: 'Negative Adverbial + Auxiliary Verb (Did/Had/Do/Can) + Subject + Main Verb',
    detailedRulesTr: [
      'Cümle başına gelen zarflar: Seldom, Rarely, Never before, Hardly/Scarcely... when, No sooner... than, Not only... but also, Under no circumstances.',
      'Soru cümlesi dizilimi (auxiliary + subject + verb) uygulanır ancak cümle soru değil, güçlü bir vurgulu ifadedir.'
    ],
    examples: [
      { en: 'Seldom have I seen such a breathtaking view.', tr: 'Böylesine nefes kesici bir manzarayı nadiren görmüşümdür.', type: 'positive' },
      { en: 'Not only did she win the award, but she also inspired thousands.', tr: 'Yalnızca ödülü kazanmakla kalmadı, aynı zamanda binlerce kişiye ilham verdi.', type: 'positive' },
      { en: 'Under no circumstances should you share your security keys.', tr: 'Hiçbir koşulda güvenlik anahtarlarınızı paylaşmamalısınız.', type: 'negative' }
    ],
    commonMistakes: [
      {
        wrong: 'Never I have felt so inspired.',
        correct: 'Never have I felt so inspired.',
        explanation: 'Olumsuz zarf başa geldiğinde yardımcı fiil özneden önce gelmelidir.'
      }
    ],
    quickCheck: [
      {
        id: 'qc-inv-1',
        question: 'Hardly _____ the office when the storm started.',
        options: ['had I left', 'I had left', 'did I leave', 'I left'],
        correctAnswer: 'had I left',
        explanation: '"Hardly" ile başlayan devrik yapıda "had + subject + V3" dizilimi kullanılır.'
      }
    ]
  },
  {
    id: 'cleft-sentences',
    level: 'C1-C2',
    category: 'İleri Yapılar & Retorik',
    title: 'Cleft Sentences (Vurgulu Bölünmüş Cümleler)',
    titleTr: 'Cleft Sentences (Vurgulu Yapılar)',
    summaryTr: 'Cümledeki belirli bir bilgiyi (özne, nesne veya sebep) öne çıkarmak için kullanılan "It is/was... that" veya "What..." yapılarıdır.',
    formula: 'It is/was + [Vurgulanan Öğe] + that/who... OR What + [Clause] + is/was + [Focus]',
    detailedRulesTr: [
      'It-Clefts: "It was John who solved the puzzle." (Bulmacayı çözen John\'du)',
      'Wh-Clefts / Pseudo-clefts: "What we really need is more time." (Asıl ihtiyacımız olan şey daha fazla zaman).'
    ],
    examples: [
      { en: 'It was her dedication that led the team to success.', tr: 'Ekibi başarıya ulaştıran şey onun adanmışlığıydı.', type: 'positive' },
      { en: 'What impressed me most was their attention to detail.', tr: 'Beni en çok etkileyen şey onların detaylara gösterdiği özendi.', type: 'positive' }
    ],
    commonMistakes: [
      {
        wrong: 'What I want it is to improve my accent.',
        correct: 'What I want is to improve my accent.',
        explanation: '"What..." cümleciğinden sonra fazladan "it" zamiri eklenmez.'
      }
    ],
    quickCheck: [
      {
        id: 'qc-cleft-1',
        question: 'It was during the 1990s _____ the World Wide Web revolutionized communication.',
        options: ['that', 'which', 'what', 'whence'],
        correctAnswer: 'that',
        explanation: 'It-cleft yapısında zaman/mekan/nesne vurgulanırken "that" bağlacı kullanılır.'
      }
    ]
  }
];
