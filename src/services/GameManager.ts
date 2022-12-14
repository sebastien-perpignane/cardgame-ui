//import {Game, HandCardModel, PlayerState} from 
import * as Stomp from "stompjs";
import {PlayerModel} from "../components/players/Player";
import { Game, HandCardModel, PlayerState } from "../components/game/Game";
import { CardModel } from "../components/cards/Card";


export interface BidValue {
    expectedScore?: number,
    suitRequired: boolean,
    display: string,
    name: string
}

export interface CardSuit {
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

interface PlayedCardEventData {
    player: PlayerModel,
    card: CardModel
}

export class GameManager {

    stompClient: Stomp.Client
    game: Game

    constructor(game: Game, stompClient: Stomp.Client) {
        this.stompClient = stompClient
        this.game = game
        this.dispatchMessage = this.dispatchMessage.bind(this)
        this.manageTrickStarted = this.manageTrickStarted.bind(this)
    }

    async dispatchMessage(message: Stomp.Message) {
        let event = JSON.parse(message.body);
        let eventData = event.eventData;

        if ((typeof eventData === 'string' || eventData instanceof String) && event.type !== 'TRICK_STARTED') {
            console.log('string event data ' + eventData)
        }
        else {
            switch(event.type) {
                case 'PLAY_TURN':
                    let playTurnEventData = event.eventData as PlayTurnEventData
                    this.managePlayTurn(playTurnEventData);
                    break
                case 'BID_TURN':
                    //manageBidTurn(event)
                    let bidTurnData = event.eventData as BidTurnEventData
                    this.manageBidTurn(bidTurnData);
                    break
                case 'PLACED_BID':
                    let placedBidData = event.eventData as PlacedBidEventData
                    this.managePlacedBid(placedBidData);
                    break;
                case 'DEAL_OVER':
                    let dealOverData = event.eventData as EndOfDealEventData
                    this.manageEndOfDeal(dealOverData)
                    break;
                case 'CARD_PLAYED':
                    let playedCardData = event.eventData as PlayedCardEventData
                    this.managePlayedCard(playedCardData)
                    break
                case 'TRICK_STARTED':
                    this.manageTrickStarted()
                    break
                default:
                    let eventDataAsStr = JSON.stringify(eventData);
                    console.log('default event type ' + eventDataAsStr)
                    //displayPlayerMessage(eventDataAsStr);
            }
        }
        return;
    }

    async subscribeToGame(gameId: string) {
        //let localClient = this.stompClient;
        this.stompClient.subscribe('/topic/game/' + gameId, this.dispatchMessage)
    }

    manageBidTurn(bidTurnEventData: BidTurnEventData) {

        let localPlayerHand: HandCardModel[] = bidTurnEventData.hand.map(cm => {
            return {card: cm, playable: false}
        });

        this.game.setLocalPlayerHand(localPlayerHand)
        this.game.setState({
            allowedBids: bidTurnEventData.allowedBidValues,
            lastTrickCards: []
        })
    }

    managePlayTurn(playTurnEventData: PlayTurnEventData) {

        let playableCardsByName = new Map(
            playTurnEventData.allowedCards.map( (card) => [card.name, card] )
        );

        let localPlayerHand: HandCardModel[] = playTurnEventData.hand.map(cm => {
            return {card: cm, playable: playableCardsByName.has(cm.name)}
        });

        this.game.setLocalPlayerHand(localPlayerHand)
        this.game.setState({
            allowedBids: []
        });
    }

    managePlacedBid(placedBidEventData: PlacedBidEventData) {

        let newPlayers: PlayerState[] = [...this.game.state.players]

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

        this.game.setState({
            players: newPlayers
        })
    }

    manageEndOfDeal(endOfDealEventData: EndOfDealEventData) {
        this.game.setState({
            team1Score: this.game.state.team1Score + endOfDealEventData.team1Score,
            team2Score: this.game.state.team2Score + endOfDealEventData.team2Score
        })
        this.manageTrickStarted()
    }

    managePlayedCard(playedCardData : PlayedCardEventData) {
        let newPlayers: PlayerState[] = [...this.game.state.players]

        let player = newPlayers.find(ps => ps.player.name === playedCardData.player.name)
        if (player !== undefined) {
            console.debug('player found :' + player.player.name)
            player.lastPlayedCard = playedCardData.card
        }
        else {
            console.debug('player not found ' + playedCardData.player.name)
        }

        this.game.setState({players: newPlayers})
    }

    private manageTrickStarted() {

        let lastTrickCards: CardModel[] = []
        this.game.state.players.forEach(p => {
            if (p.lastPlayedCard !== undefined) {
                lastTrickCards.push(p.lastPlayedCard)
            }
        })


        let newPlayers: PlayerState[] = [...this.game.state.players]
        newPlayers.forEach(np => {
            np.lastPlayedCard = undefined
        })
        this.game.setState({
            players: newPlayers,
            lastTrickCards: lastTrickCards
        })
    }

    async sleep() {
        await setTimeout(() => {}, 10000)
    }
}