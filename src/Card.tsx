import './Card.css';
import * as React from "react";

export interface CardModel {
    rank: string,
    suit: string,
    display: string,
    name: string
}

export interface CardProps {
    className: null | string,
    card: CardModel,
    clickHandler?: () => void
}

class Card extends React.Component<CardProps> {

    render() {

        let card = this.props.card;

        let cardImg: string = card.rank + card.suit.slice(0, 1)

        return (
            <div className={this.props.className + ' ccard'}
                id={this.props.card?.display}
                onClick={this.props.clickHandler}>
                <img alt="card" src={'images/' + cardImg + '.png'} />
            </div>
        );
    }

}

export default Card;