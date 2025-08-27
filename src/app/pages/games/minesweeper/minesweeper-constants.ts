import { Signal, WritableSignal } from "@angular/core";

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

export enum MinesweeperMenu {
  Game = 'Game',
  Options = 'Options',
  Help = 'Help',
  None = 'None',
}

export interface MinesweeperMenuContent {
  hasSelectableItems: boolean;
  sections: MinesweeperMenuItem[][];
}

export interface MinesweeperMenuItem {
  text: string;
  isSelected?: Signal<boolean>;
  action: () => void;
}
