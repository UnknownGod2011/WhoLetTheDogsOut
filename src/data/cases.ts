/**
 * Pre-written murder cases for the game
 * Each case is logically consistent and fair to solve
 */

export interface Suspect {
  id: string;
  name: string;
  title: string;
  alibi: string;
  motive: string;
  clues: string[];
  appearance: string;
}

export interface MurderCase {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  victim: {
    name: string;
    title: string;
    description: string;
  };
  location: string;
  timeOfDeath: string;
  setting: string;
  introNarration: string;
  suspects: Suspect[];
  trueMurderer: string;
  keyFacts: string[];
  solution: string;
  revealNarration: string;
}

export const MURDER_CASES: MurderCase[] = [
  {
    id: 'midnight-ball',
    level: 1,
    title: 'The Midnight Ball',
    subtitle: 'A dance with death',
    victim: {
      name: 'Lord Edmund Blackwood',
      title: 'Duke of Ravenshollow',
      description: 'A wealthy aristocrat found dead in his own ballroom, a glass of wine still clutched in his cold hand.',
    },
    location: 'Blackwood Manor Ballroom',
    timeOfDeath: 'Shortly before midnight',
    setting: 'The grand annual ball at Blackwood Manor. Chandeliers cast dancing shadows as the orchestra played its final waltz.',
    introNarration: `The candles flicker as I reveal tonight's tragedy. Lord Edmund Blackwood lies cold upon the marble floor of his own ballroom. The clock struck midnight, but for him, time has stopped forever. 

His wine glass bears no mark of struggle. His face, frozen in surprise rather than pain. Around him, four souls who each held darkness in their hearts.

You may ask only three questions. Choose wisely, for the truth hides in the smallest details.`,
    suspects: [
      {
        id: 'lady-victoria',
        name: 'Lady Victoria Blackwood',
        title: 'The Grieving Wife',
        alibi: 'Was dancing with the Count when the scream echoed through the hall.',
        motive: 'Stood to inherit the entire Blackwood fortune. Rumors of a secret lover.',
        clues: [
          'Her dance card shows she was with Count Aldric from 11:45 to 12:05.',
          'Servants noted she seemed unusually calm after discovering the body.',
          'A vial of her perfume was found near the body.',
        ],
        appearance: 'Elegant woman in a deep crimson gown, pearls at her throat, eyes that betray nothing.',
      },
      {
        id: 'count-aldric',
        name: 'Count Aldric von Stern',
        title: 'The Foreign Diplomat',
        alibi: 'Claims he was dancing with Lady Victoria throughout the fatal hour.',
        motive: 'Lord Blackwood had evidence of the Count\'s espionage activities.',
        clues: [
          'His gloves had traces of a rare Eastern poison.',
          'He was seen near the wine service at 11:30.',
          'The poison found requires 30 minutes to take effect.',
        ],
        appearance: 'Tall figure in military dress, silver hair, a scar across his left cheek.',
      },
      {
        id: 'dr-mortimer',
        name: 'Dr. Helena Mortimer',
        title: 'The Family Physician',
        alibi: 'Was treating a guest with a fainting spell in the east wing.',
        motive: 'Lord Blackwood threatened to expose her unlicensed medical experiments.',
        clues: [
          'Her medical bag contained the same poison found in the wine.',
          'She arrived at the ball unusually late, at 11:15.',
          'Three guests can confirm her location during the death.',
        ],
        appearance: 'Stern woman in modest black, spectacles perched on her nose, hands that never tremble.',
      },
      {
        id: 'james-butler',
        name: 'James Thornton',
        title: 'The Head Butler',
        alibi: 'Was overseeing the wine service all evening.',
        motive: 'Lord Blackwood discovered he had been embezzling funds for years.',
        clues: [
          'He personally served Lord Blackwood his final glass of wine.',
          'His quarters contained a letter threatening exposure.',
          'Multiple witnesses saw him at the wine table from 11:00 to 11:40.',
        ],
        appearance: 'Elderly man with silver temples, impeccable posture, hands weathered by decades of service.',
      },
    ],
    trueMurderer: 'count-aldric',
    keyFacts: [
      'The poison takes exactly 30 minutes to kill.',
      'Lord Blackwood drank his last wine at 11:30.',
      'Death occurred at midnight.',
      'Count Aldric was at the wine service at 11:30.',
      'The Count had access to rare Eastern poisons through diplomatic channels.',
      'Lady Victoria\'s alibi with the Count starts at 11:45 - after the wine was served.',
    ],
    solution: `Count Aldric von Stern poisoned Lord Blackwood's wine at 11:30 PM. The rare Eastern poison he used takes exactly 30 minutes to take effect. He then established an alibi by dancing with Lady Victoria from 11:45 until after midnight, ensuring he would be in plain sight when the poison claimed its victim. The traces on his gloves and his access to the wine service at the crucial moment condemn him.`,
    revealNarration: `The truth emerges from shadow into light. Count Aldric von Stern, diplomat and spy, placed poison in Lord Blackwood's wine at precisely half past eleven. He knew the poison would take thirty minutes to claim its victim.

What elegant cruelty—to dance with the widow-to-be while her husband drew his final breaths. His diplomatic immunity meant nothing against the poison's evidence on his own gloves.

Justice, like poison, works slowly but inevitably.`,
  },
  {
    id: 'whispers-library',
    level: 2,
    title: 'Whispers in the Library',
    subtitle: 'Knowledge proved deadly',
    victim: {
      name: 'Professor Arthur Crane',
      title: 'Antiquarian Scholar',
      description: 'Found slumped over an ancient manuscript, a look of terror frozen on his face.',
    },
    location: 'The Obsidian University Library',
    timeOfDeath: 'The witching hour',
    setting: 'A storm-ravaged night in the oldest wing of the university library, surrounded by forbidden texts.',
    introNarration: `Rain lashes the windows as I speak of Professor Crane's final discovery. He sought forbidden knowledge, and forbidden knowledge found him first.

His body was cold when the morning librarian arrived. The manuscript before him—gone. Torn pages scattered like autumn leaves.

Four scholars walked these halls that night. One carries the weight of murder.`,
    suspects: [
      {
        id: 'dr-wells',
        name: 'Dr. Sebastian Wells',
        title: 'Rival Academic',
        alibi: 'Claims to have been in his office grading papers until dawn.',
        motive: 'Professor Crane was about to publish research that would destroy his career.',
        clues: [
          'His office key was found near the crime scene.',
          'Ink stains matching the torn manuscript on his sleeve.',
          'Security logs show he left the building at 2 AM.',
        ],
        appearance: 'Thin man with nervous eyes, perpetually adjusting his wire-rimmed glasses.',
      },
      {
        id: 'eleanor-crane',
        name: 'Eleanor Crane',
        title: 'The Estranged Daughter',
        alibi: 'Says she was at home, but no one can verify.',
        motive: 'Her father threatened to remove her from his will.',
        clues: [
          'Her fingerprints were on the library door.',
          'She had visited her father earlier that day—they argued.',
          'She inherited everything upon his death.',
        ],
        appearance: 'Young woman with her father\'s sharp features, dressed in mourning before the death.',
      },
      {
        id: 'librarian-hayes',
        name: 'Margaret Hayes',
        title: 'Head Librarian',
        alibi: 'Left at closing time, 10 PM.',
        motive: 'Professor Crane discovered she had been selling rare books on the black market.',
        clues: [
          'Her master key grants access to all areas.',
          'A threatening note in her handwriting was found in Crane\'s desk.',
          'Multiple colleagues saw her leave at closing.',
        ],
        appearance: 'Severe woman with gray hair pulled tight, chain of keys always at her waist.',
      },
      {
        id: 'student-marcus',
        name: 'Marcus Webb',
        title: 'Graduate Student',
        alibi: 'Was studying in the main reading room until it closed.',
        motive: 'Professor Crane was blocking his thesis defense.',
        clues: [
          'He had borrowed a key to the restricted section.',
          'His research notes reference the stolen manuscript.',
          'He was the last person seen with the professor alive.',
        ],
        appearance: 'Disheveled young man with dark circles under his eyes, always carrying too many books.',
      },
    ],
    trueMurderer: 'dr-wells',
    keyFacts: [
      'The professor was killed between midnight and 2 AM.',
      'The manuscript was partially destroyed, not stolen.',
      'Dr. Wells\' security badge was used at 11:30 PM.',
      'The murder weapon was a heavy bookend.',
      'Dr. Wells\' career-ending paper was to be published next week.',
    ],
    solution: `Dr. Sebastian Wells killed Professor Crane to prevent the publication of research that would have exposed his decades of academic fraud. He returned to the building at 11:30 PM, confronted Crane, and struck him with a bookend when the professor refused to withdraw the paper. He then destroyed the manuscript containing evidence of his plagiarism.`,
    revealNarration: `Academic rivalry turns to academic murder. Dr. Wells could not allow his life's work—built on stolen ideas—to crumble. He returned under cover of storm and struck down his accuser.

The ink on his sleeves tells the tale. The security logs mark his passage. The destroyed pages were not research but evidence—evidence of a career built on lies.

Some truths are worth killing to hide. This was not one of them.`,
  },
];

export function getCaseByLevel(level: number): MurderCase | undefined {
  return MURDER_CASES.find(c => c.level === level);
}

export function getCaseById(id: string): MurderCase | undefined {
  return MURDER_CASES.find(c => c.id === id);
}
