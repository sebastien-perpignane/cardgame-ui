import {CardModel} from "./Card";
import {Game, HandCardModel, PlayerState} from "./Game";


export interface BidValue {
    expectedScore?: number,
    suitRequired: boolean,
    display: string,
    name: string
}

interface CardSuit {
    name: string,
    display: string
}

export interface BidTurnEventData {

    allowedBidValues: BidValue[],
    hand: CardModel[]

}

export interface PlayTurnEventData {
    hand: CardModel[],
    allowedCards: CardModel[]
}

export interface PlacedBidPlayer {
    name: string,
    team: string
}

export interface PlacedBidEventData {
    player: PlacedBidPlayer,
    bidValue: BidValue,
    cardSuit: CardSuit | null
}

export interface EndOfDealEventData {
    dealId: string,
    winnerTeam: string,
    team1RawScore: number,
    team2RawScore: number,
    contractIsReached: boolean,
    team1NotRounderScore: number,
    team2NotRounderScore: number,
    team1Score: number,
    team2Score: number
}

export class GameManager {

    manageBidTurn(game: Game, bidTurnEventData: BidTurnEventData) {

        let localPlayerHand: HandCardModel[] = bidTurnEventData.hand.map(cm => {
            return {card: cm, playable: false}
        });

        game.setLocalPlayerHand(localPlayerHand)
        game.setState({
            allowedBids: bidTurnEventData.allowedBidValues
        })
    }

    managePlayTurn(game: Game, playTurnEventData: PlayTurnEventData) {

        let playableCardsByName = new Map(
            playTurnEventData.allowedCards.map( (card) => [card.name, card] )
        );

        let localPlayerHand: HandCardModel[] = playTurnEventData.hand.map(cm => {
            return {card: cm, playable: playableCardsByName.has(cm.name)}
        });

        game.setLocalPlayerHand(localPlayerHand)
        game.setState({
            allowedBids: []
        });
    }

    managePlacedBid(game: Game, placedBidEventData: PlacedBidEventData) {

        let newPlayers: PlayerState[] = [...game.state.players]

        let targetPlayer = newPlayers.find(p =>  {
            return p.player.name === placedBidEventData.player.name
        })

        if (targetPlayer) {
            targetPlayer.lastBid = {
                bidSuit: placedBidEventData.cardSuit == null ? '' : placedBidEventData.cardSuit.display,
                bidValueDisplay: placedBidEventData.bidValue.display,
                bidValueExpectedScore: placedBidEventData.bidValue.expectedScore,
                bidValueName: placedBidEventData.bidValue.name,
                bidValueSuitRequired: placedBidEventData.bidValue.suitRequired
            }
        }

        game.setState({
            players: newPlayers
        })
    }

    manageEndOfDeal(game: Game, endOfDealEventData: EndOfDealEventData) {
        game.setState({
            team1Score: game.state.team1Score + endOfDealEventData.team1Score,
            team2Score: game.state.team2Score + endOfDealEventData.team2Score
        })
    }

}