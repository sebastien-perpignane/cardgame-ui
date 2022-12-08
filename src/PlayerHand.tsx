import * as React from "react";
import {PlayableCard} from "./PlayableCard";
import {CardModel} from "./Card";

export interface PlayerHandProps {
    cardImages: CardModel[]
}

export class PlayerHand extends React.Component<PlayerHandProps> {

    render() {

        let cardTags = this.props.cardImages.map(function(cardImage, i) {
            return <PlayableCard card={cardImage} key={i} className="col-md-1" clickHandler={ () => {} } />
        });
        return (
            <div className="row">
                {cardTags}
            </div>
        );

    }

}
