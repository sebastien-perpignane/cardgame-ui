//import {Game, HandCardModel, PlayerState} from 
import * as Stomp from "stompjs";
import { CurrentDealState, Game, PlayerState } from "../../components/game/Game";
import { CardModel, HandCardModel } from "../card/CardModels";
import { PlayerModel } from "../player/PlayerModels";

interface DealStartedData {
    dealNumber: number,
    dealId: string
}

interface TrickOverEventData {
    trickId: string,
    winner: string
}

interface JoinedGameEventData {
    playerIndex: number,
    playerName: string
}

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

interface TrickStartedEventData {
    trickId: string,
    trumpSuit: CardSuit
}

interface PlayedCardEventData {
    player: PlayerModel,
    card: CardModel
}

interface PlayStepStartedData {
    dealId: string,
    trumpSuit: CardSuit
}

const bidImportantCardsFilter = (cm: CardModel) => { return cm.rank === 'A' }
const bidVeryImportantCardsFilter = (cm: CardModel) => { return cm.rank === 'J' || cm.rank === '9' }

const playImportantCardsFilter = (cm: CardModel) => { return false }
const playVeryImportantCardsFilter = (trumpSuit: string) => (cm: CardModel) => { return cm.suit === trumpSuit }

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
        let event = JSON.parse(message.body)
        let eventData = event.eventData

        if ((typeof eventData === 'string' || eventData instanceof String) && event.type !== 'TRICK_STARTED' && event.type !== 'GAME_OVER') {
            console.log('string event data ' + eventData)
        }
        else {
            switch(event.type) {
                case 'DEAL_STARTED':
                    let dealStartedData = event.eventData as DealStartedData
                    this.manageDealStarted(dealStartedData)
                    break
                case 'PLACED_BID':
                    let placedBidData = event.eventData as PlacedBidEventData
                    this.managePlacedBid(placedBidData)
                    break
                case 'BID_TURN':
                    let bidTurnData = event.eventData as BidTurnEventData
                    this.manageBidTurn(bidTurnData)
                    break

                case 'PLAY_STEP_STARTED':
                    let playStepStartedData = event.eventData as PlayStepStartedData
                    this.managePlayStepStart(playStepStartedData)
                    break
                case 'PLAY_TURN':
                    let playTurnEventData = event.eventData as PlayTurnEventData
                    this.managePlayTurn(playTurnEventData)
                    break
                case 'TRICK_STARTED':
                    let trickStartedData = event.eventData as TrickStartedEventData
                    this.manageTrickStarted(trickStartedData.trumpSuit.name)
                    break
                case 'DEAL_OVER':
                    let dealOverData = event.eventData as EndOfDealEventData
                    this.manageEndOfDeal(dealOverData)
                    break
                case 'CARD_PLAYED':
                    let playedCardData = event.eventData as PlayedCardEventData
                    this.managePlayedCard(playedCardData)
                    break
                
                case 'GAME_OVER':
                    this.manageEndOfGame();
                    break
                case 'TRICK_OVER':
                    let trickOverData = event.eventData as TrickOverEventData
                    this.manageTrickOver(trickOverData)
                    break

                case 'JOINED_GAME':
                    let joinedGameData = event.eventData as JoinedGameEventData
                    this.manageJoinedGamed(joinedGameData)
                    break;

                default:
                    let eventDataAsStr = JSON.stringify(eventData);
                    console.log('default event type ' + eventDataAsStr)
            }
        }
        return;
    }

    manageJoinedGamed(joinedGameData: JoinedGameEventData) {

        if (!this.game.state.gameId) {
            console.warn("joined game event ignored as game is not started. To be managed")
            return;
        }

        let newPlayers = Array.from(this.game.state.players)

        newPlayers[joinedGameData.playerIndex].player.name = joinedGameData.playerName

        this.game.setState({
            players: newPlayers
        })
    }

    managePlayStepStart(playStepStartedData: PlayStepStartedData) {
        let dealState = this.game.state.currentDealState
        if (!dealState) {
            // TODO Study error management in JS
            throw new Error('ça doit pas arriver')
        }
        let newDealState = Object.assign(dealState, {trumpSuit: playStepStartedData.trumpSuit})
        this.game.setState({
            currentDealState: newDealState
        })
    }

    manageEndOfGame() {
        console.debug('Game is over')
        setTimeout(() => {this.game.restart()}, 2000)
        return
    }

    subscribeToGame(gameId: string, playerId: string) {
        //let localClient = this.stompClient;
        this.stompClient.subscribe('/app/topic/game/' + gameId, this.dispatchMessage, {playerId: playerId})
        this.stompClient.subscribe('/topic/game/' + gameId, this.dispatchMessage, {playerId: playerId})
        this.stompClient.subscribe('/user/topic/game/' + gameId, this.dispatchMessage, {playerId: playerId})
    }

    manageBidTurn(bidTurnEventData: BidTurnEventData) {

        let localPlayerHand: HandCardModel[] = bidTurnEventData.hand.map(cm => {
            return {card: cm, playable: false}
        });

        this.game.setLocalPlayerHand(localPlayerHand)
        this.game.setState({
            allowedBids: bidTurnEventData.allowedBidValues,
            lastTrickCards: [],
            importantCardsFilter: bidImportantCardsFilter,
            veryImportantCardsFilter: bidVeryImportantCardsFilter
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
            team2Score: this.game.state.team2Score + endOfDealEventData.team2Score,
            currentDealState: undefined

        })
        // FIXME 
        this.manageTrickStarted("fuck")
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

    private manageTrickStarted(trumpSuit: string) {

        let lastTrickCards: CardModel[] = []
        this.game.state.players.forEach(p => {
            if (p.lastPlayedCard !== undefined) {
                lastTrickCards.push(p.lastPlayedCard)
            }
        })

        let newPlayers: PlayerState[] = [...this.game.state.players]



        newPlayers.forEach(np => {
            if (np.lastPlayedCard !== undefined) {
                lastTrickCards.push(np.lastPlayedCard)
            }
            np.lastPlayedCard = undefined
        })

        let veryImportantCardsFilter = playVeryImportantCardsFilter(trumpSuit)

        this.game.setState({
            players: newPlayers,
            importantCardsFilter: playImportantCardsFilter,
            veryImportantCardsFilter: veryImportantCardsFilter
        })
    }

    manageTrickOver(trickOverData: TrickOverEventData) {

        let lastTrickCards: CardModel[] = []
        this.game.state.players.forEach(p => {
            if (p.lastPlayedCard !== undefined) {
                lastTrickCards.push(p.lastPlayedCard)
            }
        })

        let lastTrickWinner = trickOverData.winner

        this.game.setState({
            lastTrickCards: lastTrickCards,
            lastTrickWinner: lastTrickWinner
        })

    }

    private manageShit() {
        let currentDealState = this.game.state.currentDealState

        if (currentDealState === undefined) {
            throw Error("sapuduku")
        }

        let stateChanges = {dealId: 'coucou'}

        let newState: CurrentDealState = Object.assign(currentDealState, stateChanges)

        this.game.setState({
            currentDealState: newState
        })
    }

    private manageDealStarted(dealStartedData: DealStartedData) {

        this.game.setState({
            currentDealState:  {
                dealId:dealStartedData.dealId,
                dealNumber: dealStartedData.dealNumber
            }
        })

    }

}