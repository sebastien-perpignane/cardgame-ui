import './Card.css';
import * as React from "react";

type size = 'normal' | 'small'

export interface CardModel {
    rank: string,
    suit: string,
    display: string,
    name: string
}

export interface CardProps {
    className: null | string,
    card: CardModel,
    cardSize?: size
    clickHandler?: () => void
    cardStyle?: React.CSSProperties
}

class Card extends React.Component<CardProps> {

    public static defaultProps = {
        cardStyle: {}
    };

    constructor(props: CardProps) {
        super(props)
    }

    render() {

        let card = this.props.card;

        let cardImg: string = card.rank + card.suit.slice(0, 1)

        let cardSizeClass = 'ccard';
        if (this.props.cardSize !== undefined && this.props.cardSize === "small") {
            cardSizeClass = 'ccard-small'
        }

        return (
            <div className={this.props.className + ' ' + cardSizeClass}
                id={this.props.card?.display}
                onClick={this.props.clickHandler} style={this.props.cardStyle}>
                <img alt="card" src={'images/' + cardImg + '.png'} 
                />
            </div>
        );
    }

}

export default Card;