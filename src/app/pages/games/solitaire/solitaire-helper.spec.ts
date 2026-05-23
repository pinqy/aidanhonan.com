import { SolitaireGame, SolitairePile } from './solitaire-helpers';
import { Card, CardNumber, CardSuit, Deck } from '../common/card-types';

describe('SolitaireGame', () => {
  let game: SolitaireGame;

  beforeEach(() => {
    game = new SolitaireGame();
  });

  it('initializes correctly', () => {
    expect(game.dealPile.length).toEqual(0);

    expect(game.acePiles.length).toEqual(4);
    game.acePiles.forEach((pile) => expect(pile().length).toEqual(0));

    expect(game.gamePiles.length).toEqual(7);
    game.gamePiles.forEach((pile) => expect(pile().length).toEqual(0));

    expect(game.dealIndex()).toEqual(0);
    expect(game.flipPile().length).toEqual(0);
    expect(game.flipPileTopCard()).toBeUndefined();
    expect(game.flipPileTop3().length).toEqual(0);
  });

  it('new_game happy path', () => {
    game.new_game();

    game.acePiles.forEach((pile) => expect(pile().length).toEqual(0));
    game.gamePiles.forEach((pile, i) => {
      expect(pile().length).toEqual(i+1);
      pile().forEach((card, j) => {
        if (j !== i) expect(card.isRevealed()).toBeFalse();
        else expect(card.isRevealed()).toBeTrue(); // top card
      });
    });
  });

  it('flip_1 works', () => {
    game.new_game();
    let indexTrack = 0;
    while (game.dealIndex() < game.dealPile().length) {
      game.deal_1();
      indexTrack++;
      expect(game.dealIndex()).toEqual(indexTrack);
      expect(game.flipPile().length).toEqual(indexTrack);
      expect(game.flipPile()[indexTrack-1]).toEqual(game.dealPile()[indexTrack-1]);
      expect(game.flipPileTopCard()).toBeDefined();
      expect(game.flipPileTopCard()).toEqual(game.dealPile()[indexTrack-1]);
    }

    game.reset_deal();
    expect(game.flipPile().length).toEqual(0);
    expect(game.flipPileTopCard()).toBeUndefined();
    expect(game.flipPileTop3().length).toEqual(0);
    expect(game.dealIndex()).toEqual(0);
  });

  it('flip_3 works', () => {
    game.new_game();
    let indexTrack = 0;
    while (game.dealIndex() < game.dealPile().length) {
      game.deal_3();
      indexTrack += Math.min(3, game.dealPile().length-indexTrack);
      expect(game.dealIndex()).toEqual(indexTrack);
      expect(game.flipPile().length).toEqual(indexTrack);
      expect(game.flipPile()[indexTrack-1]).toEqual(game.dealPile()[indexTrack-1]);
      expect(game.flipPileTopCard()).toBeDefined();
      expect(game.flipPileTopCard()).toEqual(game.dealPile()[indexTrack-1]);
    }

    game.reset_deal();
    expect(game.flipPile().length).toEqual(0);
    expect(game.flipPileTopCard()).toBeUndefined();
    expect(game.flipPileTop3().length).toEqual(0);
    expect(game.dealIndex()).toEqual(0);
  });

  describe('find_move', () => {
    it('finds ace to empty ace pile', () => {
      game.gamePiles[0].update(pile => pile.concat(new Card(CardSuit.Clubs, CardNumber.Ace, 1)));
      const move = game.find_move(SolitairePile.Game, 0, 1);
      expect(move).toBeDefined();
      expect(move?.sourcePileType).toEqual(SolitairePile.Game);
      expect(move?.sourcePileIndex).toEqual(0);
      expect(move?.sourcePileDepth).toEqual(1);
      expect(move?.destinationPileType).toEqual(SolitairePile.Ace);
      expect(move?.destinationPileIndex).toEqual(0);
    });

    it('finds king to empty game pile', () => {
      game.gamePiles[5].update(pile => pile.concat(new Card(CardSuit.Clubs, CardNumber.King, 13)));
      const move = game.find_move(SolitairePile.Game, 5, 1);
      expect(move).toBeDefined();
      expect(move?.sourcePileType).toEqual(SolitairePile.Game);
      expect(move?.sourcePileIndex).toEqual(5);
      expect(move?.sourcePileDepth).toEqual(1);
      expect(move?.destinationPileType).toEqual(SolitairePile.Game);
      expect(move?.destinationPileIndex).toEqual(0);
    });

    it('returns undefined when no valid move', () => {
      game.gamePiles[6].update(pile => pile.concat(new Card(CardSuit.Clubs, CardNumber.Eight, 8)));
      const move = game.find_move(SolitairePile.Game, 6, 1);
      expect(move).toBeUndefined();
    });

    it('finds ace pile move first', () => {
      game.gamePiles[3].update(pile => pile.concat(new Card(CardSuit.Hearts, CardNumber.Seven, 7)));
      game.acePiles[1].update(pile => pile.concat(new Card(CardSuit.Spades, CardNumber.Five, 5)));
      game.gamePiles[0].update(pile => pile.concat(new Card(CardSuit.Spades, CardNumber.Six, 6)));
      const move = game.find_move(SolitairePile.Game, 0, 1);
      expect(move).toBeDefined();
      expect(move?.sourcePileType).toEqual(SolitairePile.Game);
      expect(move?.sourcePileIndex).toEqual(0);
      expect(move?.sourcePileDepth).toEqual(1);
      expect(move?.destinationPileType).toEqual(SolitairePile.Ace);
      expect(move?.destinationPileIndex).toEqual(1);
    });

    it('finds game pile move', () => {
      game.gamePiles[0].update(pile => pile.concat(new Card(CardSuit.Spades, CardNumber.Ten, 10)));
      game.gamePiles[3].set([new Card(CardSuit.Diamonds, CardNumber.Jack, 11)]);
      const move = game.find_move(SolitairePile.Game, 0, 1);
      expect(move).toBeDefined();
      expect(move?.sourcePileType).toEqual(SolitairePile.Game);
      expect(move?.sourcePileIndex).toEqual(0);
      expect(move?.sourcePileDepth).toEqual(1);
      expect(move?.destinationPileType).toEqual(SolitairePile.Game);
      expect(move?.destinationPileIndex).toEqual(3);
    });

    it('finds move from deal pile to game pile', () => {
      game.dealPile.set([new Card(CardSuit.Hearts, CardNumber.Four, 4)]);
      game.gamePiles[2].set([new Card(CardSuit.Clubs, CardNumber.Five, 5)]);
      const move = game.find_move(SolitairePile.Deal, 0);
      expect(move).toBeDefined();
      expect(move?.destinationPileType).toEqual(SolitairePile.Game);
      expect(move?.destinationPileIndex).toEqual(2);
    });

    it('finds move from deal pile to ace pile', () => {
      game.dealPile.set([new Card(CardSuit.Hearts, CardNumber.Jack, 11)]);
      game.acePiles[3].set([new Card(CardSuit.Hearts, CardNumber.Ten, 10)]);
      const move = game.find_move(SolitairePile.Deal, 0);
      expect(move).toBeDefined();
      expect(move?.destinationPileType).toEqual(SolitairePile.Ace);
      expect(move?.destinationPileIndex).toEqual(3);
    });
  });

  // print move if needed for debugging
  // console.log(`Move: ${move?.sourcePileType}[${move?.sourcePileIndex}] to ${move?.destinationPileType}[${move?.destinationPileIndex}]`)
  describe('execute_move', () => {
    it('moves ace to empty ace pile', () => {
      const moving_card = new Card(CardSuit.Clubs, CardNumber.Ace, 1);
      game.gamePiles[6].set([moving_card]);
      const move = game.find_move(SolitairePile.Game, 6, 1);
      expect(move).toBeDefined();
      
      expect(game.execute_move(move!)).toBeTrue();
      expect(game.gamePiles[6]().length).toEqual(0);
      expect(game.acePiles[0]().length).toEqual(1);
      expect(game.acePiles[0]()[0]).toEqual(moving_card);
    });

    it('moves king to empty game pile', () => {
      const moving_card = new Card(CardSuit.Hearts, CardNumber.King, 13);
      game.dealPile.set([moving_card]);
      const move = game.find_move(SolitairePile.Deal, 0);
      expect(move).toBeDefined();
      
      expect(game.execute_move(move!)).toBeTrue();
      expect(game.dealPile().length).toEqual(0);
      expect(game.gamePiles[0]().length).toEqual(1);
      expect(game.gamePiles[0]()[0]).toEqual(moving_card);
    });

    it('moves ace pile top card back to game', () => {
      const moving_card = new Card(CardSuit.Spades, CardNumber.Three, 3);
      game.acePiles[3].set([new Card(CardSuit.Spades, CardNumber.Ace, 1), new Card(CardSuit.Spades, CardNumber.Two, 2), moving_card]);
      game.gamePiles[1].set([new Card(CardSuit.Diamonds, CardNumber.Four, 4)]);
      const move = game.find_move(SolitairePile.Ace, 3);
      expect(move).toBeDefined();

      expect(game.execute_move(move!)).toBeTrue();
      expect(game.acePiles[3]().length).toEqual(2);
      expect(game.gamePiles[1]().length).toEqual(2);
      expect(game.gamePiles[1]()[1]).toEqual(moving_card);
    });

    it('moves card from different parts of deal pile correctly', () => {
      // Move beginning (Ace) and end (King) cards
      const deck = new Deck(false);
      game.dealPile.set(deck.cards);
      game.deal_1();
      const moving_card_beginning = deck.cards[0];
      const move_beginning = game.find_move(SolitairePile.Deal, 0);
      expect(move_beginning).toBeDefined();

      game.execute_move(move_beginning!);
      expect(game.dealPile().length).toEqual(51);
      expect(game.acePiles[0]().length).toEqual(1);
      expect(game.acePiles[0]()[0]).toEqual(moving_card_beginning);
      expect(game.dealIndex()).toEqual(0);

      game.deal_1();
      const moving_card_end = deck.cards[deck.cards.length-1];
      const move_end = game.find_move(SolitairePile.Deal, 50);
      expect(move_end).toBeDefined();

      game.execute_move(move_end!);
      expect(game.dealPile().length).toEqual(50);
      expect(game.gamePiles[0]().length).toEqual(1);
      expect(game.gamePiles[0]()[0]).toEqual(moving_card_end);
      expect(game.dealIndex()).toEqual(0);

      // Move middle card
      const srcIndex = game.dealPile().findIndex(card => card.number === CardNumber.Nine && card.suit === CardSuit.Hearts);
      const prev_card = game.dealPile()[srcIndex-1];
      const moving_card = game.dealPile()[srcIndex];
      const next_card = game.dealPile()[srcIndex+1];
      game.deal_3();
      game.gamePiles[6].set([new Card(CardSuit.Clubs, CardNumber.Ten, 10)]);
      const move = game.find_move(SolitairePile.Deal, srcIndex);
      expect(move).toBeDefined();

      expect(game.execute_move(move!)).toBeTrue();
      expect(game.dealPile().length).toEqual(49);
      expect(game.dealPile()[srcIndex-1]).toEqual(prev_card);
      expect(game.dealPile()[srcIndex]).toEqual(next_card);
      expect(game.gamePiles[6]().length).toEqual(2);
      expect(game.gamePiles[6]()[1]).toEqual(moving_card);
      expect(game.dealIndex()).toEqual(2);
    });

    it('moves multiple cards between game piles', () => {
      const destCard = new Card(CardSuit.Diamonds, CardNumber.Queen, 12);
      const srcCard1 = new Card(CardSuit.Clubs, CardNumber.Jack, 11);
      const srcCard2 = new Card(CardSuit.Hearts, CardNumber.Ten, 10);
      game.gamePiles[3].set([destCard]);
      game.gamePiles[4].set([new Card(CardSuit.Hearts, CardNumber.Queen, 12), srcCard1, srcCard2]);

      const move = game.find_move(SolitairePile.Game, 4, 2);
      expect(move).toBeDefined();

      expect(game.execute_move(move!)).toBeTrue();
      expect(game.gamePiles[4]().length).toEqual(1);
      expect(game.gamePiles[3]().length).toEqual(3);
      expect(game.gamePiles[3]()[1]).toEqual(srcCard1);
      expect(game.gamePiles[3]()[2]).toEqual(srcCard2);
    });

    it('does not execute invalid moves', () => {
      // source pile index doesn't exist
      expect(game.execute_move({sourcePileType: SolitairePile.Game, sourcePileIndex: 100, sourcePileDepth: 1, destinationPileType: SolitairePile.Game, destinationPileIndex: 1})).toBeFalse();
      expect(game.execute_move({sourcePileType: SolitairePile.Ace, sourcePileIndex: 100, destinationPileType: SolitairePile.Game, destinationPileIndex: 1})).toBeFalse();
      expect(game.execute_move({sourcePileType: SolitairePile.Deal, sourcePileIndex: 100, destinationPileType: SolitairePile.Game, destinationPileIndex: 1})).toBeFalse();

      // no card in source position
      expect(game.execute_move({sourcePileType: SolitairePile.Game, sourcePileIndex: 0, sourcePileDepth: undefined, destinationPileType: SolitairePile.Game, destinationPileIndex: 1})).toBeFalse();
      expect(game.execute_move({sourcePileType: SolitairePile.Game, sourcePileIndex: 0, sourcePileDepth: 1, destinationPileType: SolitairePile.Game, destinationPileIndex: 1})).toBeFalse();
      expect(game.execute_move({sourcePileType: SolitairePile.Ace, sourcePileIndex: 0, destinationPileType: SolitairePile.Game, destinationPileIndex: 1})).toBeFalse();

      // invalid pile move (ace -> ace or any -> deal)
      game.acePiles[0].set([new Card(CardSuit.Diamonds, CardNumber.Ace, 1)]);
      expect(game.execute_move({sourcePileType: SolitairePile.Ace, sourcePileIndex: 0, destinationPileType: SolitairePile.Ace, destinationPileIndex: 1})).toBeFalse();
      game.gamePiles[0].set([new Card(CardSuit.Hearts, CardNumber.Ace, 1)]);
      expect(game.execute_move({sourcePileType: SolitairePile.Game, sourcePileIndex: 0, sourcePileDepth: 1, destinationPileType: SolitairePile.Deal, destinationPileIndex: 0})).toBeFalse();

      // destination pile index doesn't exist
      expect(game.execute_move({sourcePileType: SolitairePile.Game, sourcePileIndex: 0, sourcePileDepth: 1, destinationPileType: SolitairePile.Game, destinationPileIndex: 100})).toBeFalse();
      expect(game.execute_move({sourcePileType: SolitairePile.Game, sourcePileIndex: 0, sourcePileDepth: 1, destinationPileType: SolitairePile.Ace, destinationPileIndex: 100})).toBeFalse();

      // invalid pile move (ace pile isn't same suit + 1 lower / game pile isn't opposite color + 1 higher)
      game.gamePiles[1].set([new Card(CardSuit.Clubs, CardNumber.Three, 3)]);
      game.acePiles[1].set([new Card(CardSuit.Clubs, CardNumber.Ace, 1)]); // Ace pile wrong number
      game.acePiles[2].set([new Card(CardSuit.Hearts, CardNumber.Ace, 1), new Card(CardSuit.Hearts, CardNumber.Two, 2)]); // Ace pile wrong suit
      game.gamePiles[2].set([new Card(CardSuit.Diamonds, CardNumber.Three, 3)]); // Game pile wrong number
      game.gamePiles[3].set([new Card(CardSuit.Spades, CardNumber.Three, 4)]); // Game pile wrong suit
      expect(game.execute_move({sourcePileType: SolitairePile.Game, sourcePileIndex: 1, sourcePileDepth: 1, destinationPileType: SolitairePile.Game, destinationPileIndex: 2})).toBeFalse();
      expect(game.execute_move({sourcePileType: SolitairePile.Game, sourcePileIndex: 1, sourcePileDepth: 1, destinationPileType: SolitairePile.Game, destinationPileIndex: 3})).toBeFalse();
      expect(game.execute_move({sourcePileType: SolitairePile.Game, sourcePileIndex: 1, sourcePileDepth: 1, destinationPileType: SolitairePile.Ace, destinationPileIndex: 1})).toBeFalse();
      expect(game.execute_move({sourcePileType: SolitairePile.Game, sourcePileIndex: 1, sourcePileDepth: 1, destinationPileType: SolitairePile.Ace, destinationPileIndex: 2})).toBeFalse();

      // invalid pile move (buried card -> ace pile)
      game.gamePiles[4].set([new Card(CardSuit.Spades, CardNumber.Four, 4), new Card(CardSuit.Hearts, CardNumber.Three, 3), new Card(CardSuit.Spades, CardNumber.Two, 2)]);
      expect(game.execute_move({sourcePileType: SolitairePile.Game, sourcePileIndex: 4, sourcePileDepth: 2, destinationPileType: SolitairePile.Ace, destinationPileIndex: 2})).toBeFalse();
    });
  });
});
