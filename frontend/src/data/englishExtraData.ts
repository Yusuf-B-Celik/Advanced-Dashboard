export interface IrregularVerb {
  id: string;
  v1: string; // Base
  v2: string; // Past Simple
  v3: string; // Past Participle
  meaningTr: string;
  exampleEn: string;
  exampleTr: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
}

export interface DailyIdiom {
  id: string;
  phrase: string;
  type: 'idiom' | 'phrasal_verb' | 'slang' | 'collocation';
  meaningTr: string;
  meaningEn: string;
  exampleDialog: {
    speakerA: string;
    speakerB: string;
  };
  tipTr: string;
}

export const IRREGULAR_VERBS: IrregularVerb[] = [
  { id: 'iv1', v1: 'be (am/is/are)', v2: 'was / were', v3: 'been', meaningTr: 'olmak', exampleEn: 'I have been to London twice.', exampleTr: 'İki kez Londra\'da bulundum.', level: 'A1' },
  { id: 'iv2', v1: 'become', v2: 'became', v3: 'become', meaningTr: 'haline gelmek, olmak', exampleEn: 'He became a skilled developer.', exampleTr: 'Yetenekli bir yazılımcı oldu.', level: 'A2' },
  { id: 'iv3', v1: 'begin', v2: 'began', v3: 'begun', meaningTr: 'başlamak', exampleEn: 'The concert began at 8 PM.', exampleTr: 'Konser saat 20:00\'de başladı.', level: 'A1' },
  { id: 'iv4', v1: 'break', v2: 'broke', v3: 'broken', meaningTr: 'kırmak, bozulmak', exampleEn: 'Who broke this glass?', exampleTr: 'Bu bardağı kim kırdı?', level: 'A1' },
  { id: 'iv5', v1: 'bring', v2: 'brought', v3: 'brought', meaningTr: 'getirmek', exampleEn: 'She brought delicious cookies.', exampleTr: 'Lezzetli kurabiyeler getirdi.', level: 'A1' },
  { id: 'iv6', v1: 'build', v2: 'built', v3: 'built', meaningTr: 'inşa etmek, kurmak', exampleEn: 'They built a modern system.', exampleTr: 'Modern bir sistem kurdular.', level: 'A2' },
  { id: 'iv7', v1: 'buy', v2: 'bought', v3: 'bought', meaningTr: 'satın almak', exampleEn: 'I bought a new mechanical keyboard.', exampleTr: 'Yeni bir mekanik klavye aldım.', level: 'A1' },
  { id: 'iv8', v1: 'catch', v2: 'caught', v3: 'caught', meaningTr: 'yakalamak, yetişmek', exampleEn: 'We caught the last bus home.', exampleTr: 'Eve giden son otobüse yetiştik.', level: 'A2' },
  { id: 'iv9', v1: 'choose', v2: 'chose', v3: 'chosen', meaningTr: 'seçmek', exampleEn: 'Have you chosen your team?', exampleTr: 'Takımını seçtin mi?', level: 'A2' },
  { id: 'iv10', v1: 'come', v2: 'came', v3: 'come', meaningTr: 'gelmek', exampleEn: 'They came to our party yesterday.', exampleTr: 'Dün partimize geldiler.', level: 'A1' },
  { id: 'iv11', v1: 'do', v2: 'did', v3: 'done', meaningTr: 'yapmak', exampleEn: 'I have done my best.', exampleTr: 'Elimden gelenin en iyisini yaptım.', level: 'A1' },
  { id: 'iv12', v1: 'drink', v2: 'drank', v3: 'drunk', meaningTr: 'içmek', exampleEn: 'He drank two cups of espresso.', exampleTr: 'İki fincan espresso içti.', level: 'A1' },
  { id: 'iv13', v1: 'drive', v2: 'drove', v3: 'driven', meaningTr: 'sürmek, araba kullanmak', exampleEn: 'She drove all the way to Izmir.', exampleTr: 'İzmir\'e kadar araba kullandı.', level: 'A1' },
  { id: 'iv14', v1: 'eat', v2: 'ate', v3: 'eaten', meaningTr: 'yemek', exampleEn: 'We have eaten lunch already.', exampleTr: 'Öğle yemeğini çoktan yedik.', level: 'A1' },
  { id: 'iv15', v1: 'fall', v2: 'fell', v3: 'fallen', meaningTr: 'düşmek', exampleEn: 'Leaves have fallen from the trees.', exampleTr: 'Ağaçlardan yapraklar düştü.', level: 'A2' },
  { id: 'iv16', v1: 'find', v2: 'found', v3: 'found', meaningTr: 'bulmak', exampleEn: 'I found a great solution online.', exampleTr: 'İnternette harika bir çözüm buldum.', level: 'A1' },
  { id: 'iv17', v1: 'fly', v2: 'flew', v3: 'flown', meaningTr: 'uçmak', exampleEn: 'We flew over the Alps.', exampleTr: 'Alplerin üzerinden uçtuk.', level: 'A2' },
  { id: 'iv18', v1: 'forget', v2: 'forgot', v3: 'forgotten', meaningTr: 'unutmak', exampleEn: 'Don\'t worry, I haven\'t forgotten.', exampleTr: 'Endişelenme, unutmadım.', level: 'A1' },
  { id: 'iv19', v1: 'get', v2: 'got', v3: 'got / gotten', meaningTr: 'almak, elde etmek, varmak', exampleEn: 'I got your message.', exampleTr: 'Mesajını aldım.', level: 'A1' },
  { id: 'iv20', v1: 'give', v2: 'gave', v3: 'given', meaningTr: 'vermek', exampleEn: 'He gave me great advice.', exampleTr: 'Bana harika tavsiyeler verdi.', level: 'A1' },
  { id: 'iv21', v1: 'go', v2: 'went', v3: 'gone', meaningTr: 'gitmek', exampleEn: 'They went to the cinema last night.', exampleTr: 'Dün gece sinemaya gittiler.', level: 'A1' },
  { id: 'iv22', v1: 'have', v2: 'had', v3: 'had', meaningTr: 'sahip olmak', exampleEn: 'We had a wonderful meeting.', exampleTr: 'Harika bir toplantı yaptık.', level: 'A1' },
  { id: 'iv23', v1: 'know', v2: 'knew', v3: 'known', meaningTr: 'bilmek, tanımak', exampleEn: 'I have known him for five years.', exampleTr: 'Onu beş yıldır tanıyorum.', level: 'A1' },
  { id: 'iv24', v1: 'make', v2: 'made', v3: 'made', meaningTr: 'yapmak, üretmek', exampleEn: 'She made a delicious chocolate cake.', exampleTr: 'Lezzetli bir çikolatalı pasta yaptı.', level: 'A1' },
  { id: 'iv25', v1: 'see', v2: 'saw', v3: 'seen', meaningTr: 'görmek', exampleEn: 'Have you seen my keys anywhere?', exampleTr: 'Anahtarlarımı hiçbir yerde gördün mü?', level: 'A1' },
  { id: 'iv26', v1: 'speak', v2: 'spoke', v3: 'spoken', meaningTr: 'konuşmak', exampleEn: 'He spoke with great confidence.', exampleTr: 'Büyük bir özgüvenle konuştu.', level: 'A1' },
  { id: 'iv27', v1: 'take', v2: 'took', v3: 'taken', meaningTr: 'almak, götürmek', exampleEn: 'It took two hours to finish.', exampleTr: 'Bitmesi iki saat sürdü.', level: 'A1' },
  { id: 'iv28', v1: 'write', v2: 'wrote', v3: 'written', meaningTr: 'yazmak', exampleEn: 'She has written several technical books.', exampleTr: 'Birkaç teknik kitap yazdı.', level: 'A1' }
];

export const DAILY_IDIOMS: DailyIdiom[] = [
  {
    id: 'di1',
    phrase: 'Piece of cake',
    type: 'idiom',
    meaningTr: 'Çocuk oyuncağı, tereyağından kıl çeker gibi kolay',
    meaningEn: 'Something that is very easy to do.',
    exampleDialog: {
      speakerA: 'Was the English exam difficult for you?',
      speakerB: 'Not at all! It was a piece of cake.'
    },
    tipTr: 'Sınav veya görevlerin çok kolay olduğunu vurgularken kullanılır.'
  },
  {
    id: 'di2',
    phrase: 'Break a leg',
    type: 'idiom',
    meaningTr: 'İyi şanslar! Şeytanın bacağını kır!',
    meaningEn: 'Used to wish someone good luck, especially before a performance or presentation.',
    exampleDialog: {
      speakerA: 'I have my presentation in ten minutes!',
      speakerB: 'You prepared well. Break a leg!'
    },
    tipTr: 'Özellikle tiyatro, sunum ve sınavlar öncesinde uğur getirmesi için söylenir.'
  },
  {
    id: 'di3',
    phrase: 'Hit the books',
    type: 'idiom',
    meaningTr: 'Ders çalışmaya gömülmek / İneklemek',
    meaningEn: 'To begin studying with serious effort.',
    exampleDialog: {
      speakerA: 'Are you coming to the party tonight?',
      speakerB: 'Sorry, I have finals tomorrow. I need to hit the books.'
    },
    tipTr: 'Yoğun çalışma dönemlerinde sıkça kullanılan samimi bir ifadedir.'
  },
  {
    id: 'di4',
    phrase: 'Call it a day',
    type: 'idiom',
    meaningTr: 'Bugünlük bu kadar demek, paydos etmek',
    meaningEn: 'To stop working on something for the rest of the day.',
    exampleDialog: {
      speakerA: 'We\'ve fixed most of the bugs today.',
      speakerB: 'Great job! Let\'s call it a day and get some rest.'
    },
    tipTr: 'İş veya çalışma gününü sonlandırırken kullanılır.'
  },
  {
    id: 'di5',
    phrase: 'Figure out',
    type: 'phrasal_verb',
    meaningTr: 'Çözmek, anlamak, yolunu bulmak',
    meaningEn: 'To solve or understand a problem after thinking.',
    exampleDialog: {
      speakerA: 'How do we configure this server?',
      speakerB: 'Don\'t worry, we will figure it out together.'
    },
    tipTr: 'Günlük konuşmada "understand" veya "solve" yerine en sık kullanılan phrasal verb\'dür.'
  },
  {
    id: 'di6',
    phrase: 'Hang in there',
    type: 'idiom',
    meaningTr: 'Dayan, pes etme, sabret',
    meaningEn: 'Said as a way of encouraging someone to keep going through difficulties.',
    exampleDialog: {
      speakerA: 'Learning a new skill is harder than I thought.',
      speakerB: 'Hang in there! It gets easier with practice.'
    },
    tipTr: 'Zorlanan birine moral ve destek vermek için söylenir.'
  },
  {
    id: 'di7',
    phrase: 'Once in a blue moon',
    type: 'idiom',
    meaningTr: 'Kırk yılda bir, ayda yılda bir (çok nadiren)',
    meaningEn: 'Very rarely; almost never.',
    exampleDialog: {
      speakerA: 'Do you ever eat fast food?',
      speakerB: 'Only once in a blue moon.'
    },
    tipTr: 'Çok seyrek gerçekleşen durumları anlatmak için kullanılır.'
  }
];
