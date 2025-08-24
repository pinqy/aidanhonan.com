import { WritableSignal } from "@angular/core";

export enum MinesweeperDifficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Expert = 'Expert',
}

export interface MinesweeperSquare {
  id: string;
  isBomb: boolean;
  number: number;
  isFlagged: WritableSignal<boolean>;
  isQuestioned: WritableSignal<boolean>;
  isOpen: WritableSignal<boolean>;
  isPressed: WritableSignal<boolean>;
}