import React, { CSSProperties } from "react";
import { CardModel } from "../../services/card/CardModels";
import { CardSuit } from "../../services/game/GameManager";
import Card from "../cards/Card";

import './Trick.css';

interface TrickProps {
    cards: CardModel[],
    trumpSuit: CardSuit
}

export class Trick extends React.Component<TrickProps> {


    render() {

        let trickCards = this.props.cards.map( (cm, i) => {
            let decal = (i * 30);
            let cardStyle: CSSProperties = {position: 'relative', right: decal + '%', transform: 'rotate(5deg)'}
            return (<Card card={cm} cardStyle={cardStyle} key={cm.name} />)
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