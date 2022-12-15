
import * as React from "react";
import { CardModel } from "../cards/Card";
import { PlayableCard } from "../cards/PlayableCard";
import { HandCardModel } from "../game/Game";

type cardFilter = (cm: CardModel) => boolean;

export interface PlayerHandProps {
    gameId: string,
    handCards: HandCardModel[],
    importantFilter?: cardFilter,
    veryImportantFilter?: cardFilter
}

export class PlayerHand extends React.Component<PlayerHandProps> {

    render() {

        let cardTags = this.props.handCards.map((handCard) => {
            return <PlayableCard 
                        gameId={this.props.gameId} 
                        card={handCard.card} 
                        key={'playerHand-' + handCard.card.name} 
                        className="col" 
                        playable={handCard.playable}
                        importantCardsFilter={this.props.importantFilter}
                        veryImportantCardsFilter={this.props.veryImportantFilter}
                         />
        });
        return (
            <div className="row">
                {cardTags}
            </div>
        );

    }

}
