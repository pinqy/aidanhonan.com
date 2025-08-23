export enum MinesweeperDifficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Expert = 'Expert',
}

export interface MinesweeperSquare {
  isBomb: boolean;
  number: number;
  isFlagged: boolean;
  isQuestioned: boolean;
  isOpen: boolean;
  id: string;
}

export const TEST_BOARD: MinesweeperSquare[][] = [
  [
    {
      isBomb: false,
      isFlagged: false,
      isQuestioned: false,
      isOpen: true,
      number: 1,
      id: "0_0"
    },
    {
      isBomb: false,
      isFlagged: false,
      isQuestioned: false,
      isOpen: true,
      number: 2,
      id: "0_1",
    },
    {
      isBomb: false,
      isFlagged: false,
      isQuestioned: false,
      isOpen: true,
      number: 3,
      id: "0_2",
    },
  ], [
    {
      isBomb: false,
      isFlagged: false,
      isQuestioned: false,
      isOpen: true,
      number: 4,
      id: "1_0",
    },
    {
      isBomb: false,
      isFlagged: false,
      isQuestioned: false,
      isOpen: true,
      number: 5,
      id: "1_1",
    },
    {
      isBomb: false,
      isFlagged: false,
      isQuestioned: false,
      isOpen: true,
      number: 6,
      id: "1_2",
    },
  ], [
    {
      isBomb: false,
      isFlagged: false,
      isQuestioned: false,
      isOpen: true,
      number: 7,
      id: "2_0",
    },
    {
      isBomb: false,
      isFlagged: false,
      isQuestioned: false,
      isOpen: true,
      number: 8,
      id: "2_1",
    },
    {
      isBomb: false,
      isFlagged: false,
      isQuestioned: false,
      isOpen: false,
      number: 0,
      id: "2_2",
    },
  ]
]