import React, { CSSProperties } from "react";
import { CardSuit } from "../../services/GameManager";
import Card, { CardModel } from "../cards/Card";

import './Trick.css';

interface TrickProps {
    cards: CardModel[],
    trump: CardSuit
}

export class Trick extends React.Component<TrickProps> {


    render() {

        let trickCards = this.props.cards.map( (cm, i) => {
            let decal = (i * 30);

            let cardStyle: CSSProperties = {position: 'relative', right: decal + '%', transform: 'rotate(5deg)'}

            return (<Card card={cm} className='pouet' cardStyle={cardStyle} />)
        })

        return (
            <div id='trick-container'>
                <div id="trick-card-container" style={{ textAlign: 'center'}}>

                    {trickCards}

                </div>
            </div>
        );

    }

}