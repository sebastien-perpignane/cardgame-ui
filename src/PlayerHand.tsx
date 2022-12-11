import * as React from "react";
import {PlayableCard} from "./PlayableCard";
import {HandCardModel} from "./Game";

export interface PlayerHandProps {
    gameId: string,
    handCards: HandCardModel[]
}

export class PlayerHand extends React.Component<PlayerHandProps> {

    render() {

        let cardTags = this.props.handCards.map((handCard) => {
            return <PlayableCard gameId={this.props.gameId} card={handCard.card} key={'playerHand-' + handCard.card.name} className="col" playable={handCard.playable} />
        });
        return (
            <div className="row">
                {cardTags}
            </div>
        );

    }

}
