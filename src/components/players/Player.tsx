import * as React from "react";
import { CardModel } from "../../services/card/CardModels";
import Card from "../cards/Card";
import { CardPlaceHolder } from "../cards/CardPlaceHolder";
import { BidModel, ContreeBid } from "../game/ContreeBid";



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
            lastPlayedCard = <Card className={'lastPlayedCard'} card={card} clickHandler={() => {} } cardSize='small' />
        }

        let bidValue = lastBid?.bidValueDisplay === undefined ? '' : lastBid.bidValueDisplay
        let bidSuit = lastBid?.bidSuit === undefined ? '' : lastBid.bidSuit

        return (
                <div className="player" key={this.props.playerIndex} style={{display: "grid", gridTemplateColumns: '2fr 1fr'}} >
                    <div style={ {display: "inline-block", verticalAlign: "middle", textAlign: "left"} }>
                        <div style={{alignContent: 'center'}}>Player {this.props.playerIndex}: {this.props.name}</div>
                        <ContreeBid bidValueDisplay={bidValue} bidSuit={bidSuit}  />
                    </div>
                    <div style={ {display: "inline", verticalAlign: "middle"} }>
                        {lastPlayedCard}
                    </div>

            </div>
        );
    }

}
