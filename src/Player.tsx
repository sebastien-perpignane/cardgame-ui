import * as React from "react";
import Card, {CardModel} from "./Card";
import {BidModel, ContreeBid} from "./ContreeBid";

export interface PlayerModel {
    name: string
}

interface PlayerProps {
    playerIndex: number,
    name: string,
    lastBid?: BidModel,
    lastPlayedCard?: CardModel
}

export class Player extends React.Component<PlayerProps> {

    render() {
        const card = this.props.lastPlayedCard
        const lastBid = this.props.lastBid

        return (
            <div className="player" key={this.props.playerIndex}>
                <p>Player {this.props.playerIndex}: {this.props.name}</p>
                {lastBid && <ContreeBid bidValueDisplay={lastBid.bidValueDisplay} bidSuit={lastBid.bidSuit}  />}
                {(card !== undefined ) && <Card className={'lastPlayedCard'} card={card} clickHandler={() => {} } />}
            </div>
        );
    }

}
