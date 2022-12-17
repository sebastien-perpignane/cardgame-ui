import './Card.css';
import * as React from "react";
import { CardModel } from '../../services/card/CardModels';

type size = 'normal' | 'small'



export interface CardProps {
    className?: string,
    card: CardModel,
    cardSize?: size
    clickHandler?: () => void
    cardStyle?: React.CSSProperties
}

class Card extends React.Component<CardProps> {

    public static defaultProps = {
        cardStyle: {}
    };

    render() {

        let card = this.props.card;

        let cardImg: string = card.rank + card.suit.slice(0, 1)

        let cardSizeClass = 'ccard';
        if (this.props.cardSize !== undefined && this.props.cardSize === "small") {
            cardSizeClass = 'ccard-small'
        }

        let pClassName = this.props.className === undefined ? '' : this.props.className

        return (
            <div className={pClassName + ' ' + cardSizeClass}
                id={'c' + this.props.card?.display}
                onClick={this.props.clickHandler}
                style={this.props.cardStyle}>
                <img alt="card" src={'images/' + cardImg + '.png'} onClick={this.props.clickHandler}
                />
            </div>
        );
    }

}

export default Card;