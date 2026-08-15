// GENERATED FILE — do not edit by hand.
// Reference tables from bazi_db; solar-term instants computed from solar geometry.
// Regenerate with: npm run gen:data

export type Element = 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER'
export type Polarity = 'YANG' | 'YIN'
export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER'

export interface HeavenlyStem { id: number; name: string; polarity: Polarity; element: Element }
export interface EarthlyBranch {
  id: number; name: string; animal: string; polarity: Polarity; element: Element
  hiddenStems: number[]; season: Season; structure: Element
}

/** 10 Heavenly Stems (Thiên Can). */
export const HEAVENLY_STEMS: HeavenlyStem[] = [
  {
    "id": 1,
    "name": "JIA",
    "polarity": "YANG",
    "element": "WOOD"
  },
  {
    "id": 2,
    "name": "YI",
    "polarity": "YIN",
    "element": "WOOD"
  },
  {
    "id": 3,
    "name": "BING",
    "polarity": "YANG",
    "element": "FIRE"
  },
  {
    "id": 4,
    "name": "DING",
    "polarity": "YIN",
    "element": "FIRE"
  },
  {
    "id": 5,
    "name": "WU",
    "polarity": "YANG",
    "element": "EARTH"
  },
  {
    "id": 6,
    "name": "JI",
    "polarity": "YIN",
    "element": "EARTH"
  },
  {
    "id": 7,
    "name": "GENG",
    "polarity": "YANG",
    "element": "METAL"
  },
  {
    "id": 8,
    "name": "XIN",
    "polarity": "YIN",
    "element": "METAL"
  },
  {
    "id": 9,
    "name": "REN",
    "polarity": "YANG",
    "element": "WATER"
  },
  {
    "id": 10,
    "name": "GUI",
    "polarity": "YIN",
    "element": "WATER"
  }
]

/** 12 Earthly Branches (Địa Chi); hidden stems are ordered main-first. */
export const EARTHLY_BRANCHES: EarthlyBranch[] = [
  {
    "id": 1,
    "name": "ZI",
    "animal": "RAT",
    "polarity": "YANG",
    "element": "WATER",
    "hiddenStems": [
      10
    ],
    "season": "WINTER",
    "structure": "WATER"
  },
  {
    "id": 2,
    "name": "CHOU",
    "animal": "OX",
    "polarity": "YIN",
    "element": "EARTH",
    "hiddenStems": [
      6,
      8,
      10
    ],
    "season": "WINTER",
    "structure": "METAL"
  },
  {
    "id": 3,
    "name": "YIN",
    "animal": "TIGER",
    "polarity": "YANG",
    "element": "WOOD",
    "hiddenStems": [
      1,
      3,
      5
    ],
    "season": "SPRING",
    "structure": "FIRE"
  },
  {
    "id": 4,
    "name": "MAO",
    "animal": "RABBIT",
    "polarity": "YIN",
    "element": "WOOD",
    "hiddenStems": [
      2
    ],
    "season": "SPRING",
    "structure": "WOOD"
  },
  {
    "id": 5,
    "name": "CHEN",
    "animal": "DRAGON",
    "polarity": "YANG",
    "element": "EARTH",
    "hiddenStems": [
      5,
      2,
      10
    ],
    "season": "SPRING",
    "structure": "WATER"
  },
  {
    "id": 6,
    "name": "SI",
    "animal": "SNAKE",
    "polarity": "YIN",
    "element": "FIRE",
    "hiddenStems": [
      3,
      5,
      7
    ],
    "season": "SUMMER",
    "structure": "METAL"
  },
  {
    "id": 7,
    "name": "WU",
    "animal": "HORSE",
    "polarity": "YANG",
    "element": "FIRE",
    "hiddenStems": [
      4,
      6
    ],
    "season": "SUMMER",
    "structure": "FIRE"
  },
  {
    "id": 8,
    "name": "WEI",
    "animal": "GOAT",
    "polarity": "YIN",
    "element": "EARTH",
    "hiddenStems": [
      6,
      2,
      4
    ],
    "season": "SUMMER",
    "structure": "WOOD"
  },
  {
    "id": 9,
    "name": "SHEN",
    "animal": "MONKEY",
    "polarity": "YANG",
    "element": "METAL",
    "hiddenStems": [
      7,
      5,
      9
    ],
    "season": "AUTUMN",
    "structure": "WATER"
  },
  {
    "id": 10,
    "name": "YOU",
    "animal": "ROOSTER",
    "polarity": "YIN",
    "element": "METAL",
    "hiddenStems": [
      8
    ],
    "season": "AUTUMN",
    "structure": "METAL"
  },
  {
    "id": 11,
    "name": "XU",
    "animal": "DOG",
    "polarity": "YANG",
    "element": "EARTH",
    "hiddenStems": [
      5,
      4,
      8
    ],
    "season": "AUTUMN",
    "structure": "FIRE"
  },
  {
    "id": 12,
    "name": "HAI",
    "animal": "PIG",
    "polarity": "YIN",
    "element": "WATER",
    "hiddenStems": [
      9,
      1
    ],
    "season": "WINTER",
    "structure": "WOOD"
  }
]

/** The 60 JiaZi (Lục thập hoa giáp). */
export const SEXAGENARY: { id: number; stem: number; branch: number }[] = [
  {
    "id": 1,
    "stem": 1,
    "branch": 1
  },
  {
    "id": 2,
    "stem": 2,
    "branch": 2
  },
  {
    "id": 3,
    "stem": 3,
    "branch": 3
  },
  {
    "id": 4,
    "stem": 4,
    "branch": 4
  },
  {
    "id": 5,
    "stem": 5,
    "branch": 5
  },
  {
    "id": 6,
    "stem": 6,
    "branch": 6
  },
  {
    "id": 7,
    "stem": 7,
    "branch": 7
  },
  {
    "id": 8,
    "stem": 8,
    "branch": 8
  },
  {
    "id": 9,
    "stem": 9,
    "branch": 9
  },
  {
    "id": 10,
    "stem": 10,
    "branch": 10
  },
  {
    "id": 11,
    "stem": 1,
    "branch": 11
  },
  {
    "id": 12,
    "stem": 2,
    "branch": 12
  },
  {
    "id": 13,
    "stem": 3,
    "branch": 1
  },
  {
    "id": 14,
    "stem": 4,
    "branch": 2
  },
  {
    "id": 15,
    "stem": 5,
    "branch": 3
  },
  {
    "id": 16,
    "stem": 6,
    "branch": 4
  },
  {
    "id": 17,
    "stem": 7,
    "branch": 5
  },
  {
    "id": 18,
    "stem": 8,
    "branch": 6
  },
  {
    "id": 19,
    "stem": 9,
    "branch": 7
  },
  {
    "id": 20,
    "stem": 10,
    "branch": 8
  },
  {
    "id": 21,
    "stem": 1,
    "branch": 9
  },
  {
    "id": 22,
    "stem": 2,
    "branch": 10
  },
  {
    "id": 23,
    "stem": 3,
    "branch": 11
  },
  {
    "id": 24,
    "stem": 4,
    "branch": 12
  },
  {
    "id": 25,
    "stem": 5,
    "branch": 1
  },
  {
    "id": 26,
    "stem": 6,
    "branch": 2
  },
  {
    "id": 27,
    "stem": 7,
    "branch": 3
  },
  {
    "id": 28,
    "stem": 8,
    "branch": 4
  },
  {
    "id": 29,
    "stem": 9,
    "branch": 5
  },
  {
    "id": 30,
    "stem": 10,
    "branch": 6
  },
  {
    "id": 31,
    "stem": 1,
    "branch": 7
  },
  {
    "id": 32,
    "stem": 2,
    "branch": 8
  },
  {
    "id": 33,
    "stem": 3,
    "branch": 9
  },
  {
    "id": 34,
    "stem": 4,
    "branch": 10
  },
  {
    "id": 35,
    "stem": 5,
    "branch": 11
  },
  {
    "id": 36,
    "stem": 6,
    "branch": 12
  },
  {
    "id": 37,
    "stem": 7,
    "branch": 1
  },
  {
    "id": 38,
    "stem": 8,
    "branch": 2
  },
  {
    "id": 39,
    "stem": 9,
    "branch": 3
  },
  {
    "id": 40,
    "stem": 10,
    "branch": 4
  },
  {
    "id": 41,
    "stem": 1,
    "branch": 5
  },
  {
    "id": 42,
    "stem": 2,
    "branch": 6
  },
  {
    "id": 43,
    "stem": 3,
    "branch": 7
  },
  {
    "id": 44,
    "stem": 4,
    "branch": 8
  },
  {
    "id": 45,
    "stem": 5,
    "branch": 9
  },
  {
    "id": 46,
    "stem": 6,
    "branch": 10
  },
  {
    "id": 47,
    "stem": 7,
    "branch": 11
  },
  {
    "id": 48,
    "stem": 8,
    "branch": 12
  },
  {
    "id": 49,
    "stem": 9,
    "branch": 1
  },
  {
    "id": 50,
    "stem": 10,
    "branch": 2
  },
  {
    "id": 51,
    "stem": 1,
    "branch": 3
  },
  {
    "id": 52,
    "stem": 2,
    "branch": 4
  },
  {
    "id": 53,
    "stem": 3,
    "branch": 5
  },
  {
    "id": 54,
    "stem": 4,
    "branch": 6
  },
  {
    "id": 55,
    "stem": 5,
    "branch": 7
  },
  {
    "id": 56,
    "stem": 6,
    "branch": 8
  },
  {
    "id": 57,
    "stem": 7,
    "branch": 9
  },
  {
    "id": 58,
    "stem": 8,
    "branch": 10
  },
  {
    "id": 59,
    "stem": 9,
    "branch": 11
  },
  {
    "id": 60,
    "stem": 10,
    "branch": 12
  }
]

/** The 10 Gods (Thập Thần). */
export const TEN_GODS: { id: number; name: string; abbr: string }[] = [
  {
    "id": 1,
    "name": "DIRECT WEALTH STAR",
    "abbr": "DW"
  },
  {
    "id": 2,
    "name": "INDIRECT WEALTH STAR",
    "abbr": "IW"
  },
  {
    "id": 3,
    "name": "DIRECT OFFICER STAR",
    "abbr": "DO"
  },
  {
    "id": 4,
    "name": "7 KILLING STAR",
    "abbr": "7K"
  },
  {
    "id": 5,
    "name": "DIRECT RESOURCE STAR",
    "abbr": "DR"
  },
  {
    "id": 6,
    "name": "INDIRECT RESOURCE STAR",
    "abbr": "IR"
  },
  {
    "id": 7,
    "name": "EATING GOD STAR",
    "abbr": "EG"
  },
  {
    "id": 8,
    "name": "HURTING OFFICER STAR",
    "abbr": "HO"
  },
  {
    "id": 9,
    "name": "FRIEND STAR",
    "abbr": "F"
  },
  {
    "id": 10,
    "name": "ROB WEALTH STAR",
    "abbr": "RW"
  }
]

/** TEN_GOD_GRID[dayMaster-1][stem-1] -> ten god id. */
export const TEN_GOD_GRID: number[][] = [
  [
    9,
    10,
    7,
    8,
    2,
    1,
    4,
    3,
    6,
    5
  ],
  [
    10,
    9,
    8,
    7,
    1,
    2,
    3,
    4,
    5,
    6
  ],
  [
    6,
    5,
    9,
    10,
    7,
    8,
    2,
    1,
    4,
    3
  ],
  [
    5,
    6,
    10,
    9,
    8,
    7,
    1,
    2,
    3,
    4
  ],
  [
    4,
    3,
    6,
    5,
    9,
    10,
    7,
    8,
    2,
    1
  ],
  [
    3,
    4,
    5,
    6,
    10,
    9,
    8,
    7,
    1,
    2
  ],
  [
    2,
    1,
    4,
    3,
    6,
    5,
    9,
    10,
    7,
    8
  ],
  [
    1,
    2,
    3,
    4,
    5,
    6,
    10,
    9,
    8,
    7
  ],
  [
    7,
    8,
    2,
    1,
    4,
    3,
    6,
    5,
    9,
    10
  ],
  [
    8,
    7,
    1,
    2,
    3,
    4,
    5,
    6,
    10,
    9
  ]
]

/** PHASE_GRID[stem-1][branch-1] -> 12-phase id (1 = Trường Sinh). */
export const PHASE_GRID: number[][] = [
  [
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    1
  ],
  [
    7,
    6,
    5,
    4,
    3,
    2,
    1,
    12,
    11,
    10,
    9,
    8
  ],
  [
    11,
    12,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10
  ],
  [
    10,
    9,
    8,
    7,
    6,
    5,
    4,
    3,
    2,
    1,
    12,
    11
  ],
  [
    11,
    12,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10
  ],
  [
    10,
    9,
    8,
    7,
    6,
    5,
    4,
    3,
    2,
    1,
    12,
    11
  ],
  [
    8,
    9,
    10,
    11,
    12,
    1,
    2,
    3,
    4,
    5,
    6,
    7
  ],
  [
    1,
    12,
    11,
    10,
    9,
    8,
    7,
    6,
    5,
    4,
    3,
    2
  ],
  [
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    1,
    2,
    3,
    4
  ],
  [
    4,
    3,
    2,
    1,
    12,
    11,
    10,
    9,
    8,
    7,
    6,
    5
  ]
]

/**
 * HOUR_GRID[dayStem-1][slot] -> hour pillar JiaZi index.
 * Slots 0..11 are Zi..Hai; slot 12 is the late Zi hour (23:00-24:00), which
 * borrows the next day's stem while the day pillar stays unchanged.
 */
export const HOUR_GRID: number[][] = [
  [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13
  ],
  [
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25
  ],
  [
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37
  ],
  [
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49
  ],
  [
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    1
  ],
  [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13
  ],
  [
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25
  ],
  [
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37
  ],
  [
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49
  ],
  [
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    1
  ]
]

/** Seasonal strength of each element, 1 (weakest) to 5 (strongest). */
export const SEASON_STRENGTH: { season: Season; element: Element; strength: number }[] = [
  {
    "season": "SPRING",
    "element": "METAL",
    "strength": 2
  },
  {
    "season": "SPRING",
    "element": "WOOD",
    "strength": 5
  },
  {
    "season": "SPRING",
    "element": "WATER",
    "strength": 3
  },
  {
    "season": "SPRING",
    "element": "FIRE",
    "strength": 4
  },
  {
    "season": "SPRING",
    "element": "EARTH",
    "strength": 1
  },
  {
    "season": "SUMMER",
    "element": "METAL",
    "strength": 1
  },
  {
    "season": "SUMMER",
    "element": "WOOD",
    "strength": 3
  },
  {
    "season": "SUMMER",
    "element": "WATER",
    "strength": 2
  },
  {
    "season": "SUMMER",
    "element": "FIRE",
    "strength": 5
  },
  {
    "season": "SUMMER",
    "element": "EARTH",
    "strength": 4
  },
  {
    "season": "AUTUMN",
    "element": "METAL",
    "strength": 5
  },
  {
    "season": "AUTUMN",
    "element": "WOOD",
    "strength": 1
  },
  {
    "season": "AUTUMN",
    "element": "WATER",
    "strength": 4
  },
  {
    "season": "AUTUMN",
    "element": "FIRE",
    "strength": 2
  },
  {
    "season": "AUTUMN",
    "element": "EARTH",
    "strength": 3
  },
  {
    "season": "WINTER",
    "element": "METAL",
    "strength": 3
  },
  {
    "season": "WINTER",
    "element": "WOOD",
    "strength": 4
  },
  {
    "season": "WINTER",
    "element": "WATER",
    "strength": 5
  },
  {
    "season": "WINTER",
    "element": "FIRE",
    "strength": 1
  },
  {
    "season": "WINTER",
    "element": "EARTH",
    "strength": 2
  }
]

/** Favourable / unfavourable elements (dụng thần, kỵ thần) by day master and strength. */
export const FAVOURABLE: { element: Element; strength: 'WEAK' | 'STRONG'; favourable: Element[]; unfavourable: Element[] }[] = [
  {
    "element": "WOOD",
    "strength": "WEAK",
    "favourable": [
      "WOOD",
      "WATER"
    ],
    "unfavourable": [
      "FIRE",
      "EARTH",
      "METAL"
    ]
  },
  {
    "element": "WOOD",
    "strength": "STRONG",
    "favourable": [
      "FIRE",
      "EARTH",
      "METAL"
    ],
    "unfavourable": [
      "WOOD",
      "WATER"
    ]
  },
  {
    "element": "WATER",
    "strength": "WEAK",
    "favourable": [
      "WATER",
      "METAL"
    ],
    "unfavourable": [
      "FIRE",
      "EARTH",
      "WOOD"
    ]
  },
  {
    "element": "WATER",
    "strength": "STRONG",
    "favourable": [
      "FIRE",
      "EARTH",
      "WOOD"
    ],
    "unfavourable": [
      "WATER",
      "METAL"
    ]
  },
  {
    "element": "METAL",
    "strength": "WEAK",
    "favourable": [
      "METAL",
      "EARTH"
    ],
    "unfavourable": [
      "FIRE",
      "WOOD",
      "WATER"
    ]
  },
  {
    "element": "METAL",
    "strength": "STRONG",
    "favourable": [
      "FIRE",
      "WOOD",
      "WATER"
    ],
    "unfavourable": [
      "METAL",
      "EARTH"
    ]
  },
  {
    "element": "EARTH",
    "strength": "WEAK",
    "favourable": [
      "EARTH",
      "FIRE"
    ],
    "unfavourable": [
      "WATER",
      "METAL",
      "WOOD"
    ]
  },
  {
    "element": "EARTH",
    "strength": "STRONG",
    "favourable": [
      "WATER",
      "METAL",
      "WOOD"
    ],
    "unfavourable": [
      "EARTH",
      "FIRE"
    ]
  },
  {
    "element": "FIRE",
    "strength": "WEAK",
    "favourable": [
      "FIRE",
      "WOOD"
    ],
    "unfavourable": [
      "WATER",
      "METAL",
      "EARTH"
    ]
  },
  {
    "element": "FIRE",
    "strength": "STRONG",
    "favourable": [
      "WATER",
      "METAL",
      "EARTH"
    ],
    "unfavourable": [
      "FIRE",
      "WOOD"
    ]
  }
]

/** Structural relation of each element to the day master's element. */
export const STRUCTURE: { self: Element; relations: Record<Element, string> }[] = [
  {
    "self": "METAL",
    "relations": {
      "METAL": "COMPANION",
      "WOOD": "WEALTH",
      "EARTH": "RESOURCE",
      "WATER": "OUTPUT",
      "FIRE": "INFLUENCE"
    }
  },
  {
    "self": "WOOD",
    "relations": {
      "METAL": "INFLUENCE",
      "WOOD": "COMPANION",
      "EARTH": "WEALTH",
      "WATER": "RESOURCE",
      "FIRE": "OUTPUT"
    }
  },
  {
    "self": "EARTH",
    "relations": {
      "METAL": "OUTPUT",
      "WOOD": "INFLUENCE",
      "EARTH": "COMPANION",
      "WATER": "WEALTH",
      "FIRE": "RESOURCE"
    }
  },
  {
    "self": "WATER",
    "relations": {
      "METAL": "RESOURCE",
      "WOOD": "OUTPUT",
      "EARTH": "INFLUENCE",
      "WATER": "COMPANION",
      "FIRE": "WEALTH"
    }
  },
  {
    "self": "FIRE",
    "relations": {
      "METAL": "WEALTH",
      "WOOD": "RESOURCE",
      "EARTH": "OUTPUT",
      "WATER": "INFLUENCE",
      "FIRE": "COMPANION"
    }
  }
]

/** Branch relationships. targets[i] is the branch (1-12) related to branch i+1, or null. */
export const BRANCH_RELATIONS: { type: string; targets: (number | null)[] }[] = [
  {
    "type": "SIX_COMBINATION",
    "targets": [
      2,
      1,
      12,
      11,
      10,
      9,
      8,
      7,
      6,
      5,
      4,
      3
    ]
  },
  {
    "type": "CLASH",
    "targets": [
      7,
      8,
      9,
      10,
      11,
      12,
      1,
      2,
      3,
      4,
      5,
      6
    ]
  },
  {
    "type": "DESTRUCTION",
    "targets": [
      10,
      5,
      12,
      7,
      2,
      9,
      4,
      11,
      6,
      1,
      8,
      3
    ]
  },
  {
    "type": "HARM",
    "targets": [
      8,
      7,
      6,
      5,
      4,
      3,
      2,
      1,
      12,
      11,
      10,
      9
    ]
  },
  {
    "type": "UNGRATEFUL_PUNISHMENT",
    "targets": [
      null,
      null,
      6,
      null,
      null,
      3,
      null,
      null,
      3,
      null,
      null,
      null
    ]
  },
  {
    "type": "UNGRATEFUL_PUNISHMENT",
    "targets": [
      null,
      null,
      9,
      null,
      null,
      9,
      null,
      null,
      6,
      null,
      null,
      null
    ]
  },
  {
    "type": "BULLYING_PUNISHMENT",
    "targets": [
      null,
      8,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      2,
      null
    ]
  },
  {
    "type": "BULLYING_PUNISHMENT",
    "targets": [
      null,
      11,
      null,
      null,
      null,
      null,
      null,
      11,
      null,
      null,
      8,
      null
    ]
  },
  {
    "type": "UNCIVILIZED_PUNISHMENT",
    "targets": [
      4,
      null,
      null,
      1,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ]
  },
  {
    "type": "SELF_PUNISHMENT",
    "targets": [
      null,
      null,
      null,
      null,
      5,
      null,
      7,
      null,
      null,
      10,
      null,
      12
    ]
  }
]

/** Stem relationships. targets[i] is the stem (1-10) related to stem i+1, or null. */
export const STEM_RELATIONS: { type: string; targets: (number | null)[] }[] = [
  {
    "type": "COMBINATION",
    "targets": [
      6,
      7,
      8,
      9,
      10,
      1,
      2,
      3,
      4,
      5
    ]
  },
  {
    "type": "COUNTER",
    "targets": [
      5,
      6,
      7,
      8,
      9,
      10,
      1,
      2,
      3,
      4
    ]
  },
  {
    "type": "CLASH",
    "targets": [
      7,
      8,
      9,
      10,
      null,
      null,
      1,
      2,
      3,
      4
    ]
  }
]
