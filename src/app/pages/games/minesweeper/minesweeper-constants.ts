import { Signal, WritableSignal } from '@angular/core';

export enum MinesweeperDifficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Expert = 'Expert',
  Custom = 'Custom',
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
  hoverText?: string;
}

export enum MinesweeperSetting {
  OpeningMove = 'opening_move',
  QuestionMarks = 'question_marks',
  AreaOpen = 'area_open',
  OpenRemaining = 'open_remaining',
}

export enum MinesweeperCookie {
  Difficulty = 'mines_difficulty',
  CustomX = 'mines_custom_width',
  CustomY = 'mines_custom_height',
  CustomBombs = 'mines_custom_bombs',
  OpeningMove = 'mines_opening_move',
  QuestionMarks = 'mines_question_marks',
  AreaOpen = 'mines_area_open',
  OpenRemaining = 'mines_open_remaining',
}