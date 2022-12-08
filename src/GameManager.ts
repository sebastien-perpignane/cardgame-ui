import {CardModel} from "./Card";
import {Game} from "./Game";


interface BidValue {
    expectedScore?: number,
    suitRequired: boolean,
    display: string,
    name: string
}

interface CardSuit {
    name: string,
    display: string
}

interface BidTurnEventData {

    allowedBidValues: BidValue[],
    hand: CardModel[]

}

export class GameManager {

    manageBidTurn(game: Game, event: any) {
        let bidTurnData = event.eventData as BidTurnEventData
        game.setState({
            localPlayerHand: bidTurnData.hand
        })
    }

}