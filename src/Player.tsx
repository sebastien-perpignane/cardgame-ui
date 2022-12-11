import * as React from "react";
import Card, {CardModel} from "./Card";
import {BidModel, ContreeBid} from "./ContreeBid";
import {CardPlaceHolder} from "./CardPlaceHolder";

export interface PlayerModel {
    name: string,
    team?: string
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

        let lastPlayedCard: any
        if (card === undefined) {
            lastPlayedCard = <CardPlaceHolder />
        }
        else {
            lastPlayedCard = <Card className={'lastPlayedCard'} card={card} clickHandler={() => {} } />
        }

        let bidValue = lastBid?.bidValueDisplay === undefined ? '' : lastBid.bidValueDisplay
        let bidSuit = lastBid?.bidSuit === undefined ? '' : lastBid.bidSuit

        return (
                <div className="player" key={this.props.playerIndex} style={{textAlign: "center"}} >
                    <div style={ {display: "inline-block", verticalAlign: "middle"} }>
                        <p>Player {this.props.playerIndex}: {this.props.name}</p>
                        <ContreeBid bidValueDisplay={bidValue} bidSuit={bidSuit}  />
                    </div>
                    <div style={ {display: "inline-block", verticalAlign: "middle"} }>
                        {lastPlayedCard}
                    </div>

            </div>
        );
    }

}
