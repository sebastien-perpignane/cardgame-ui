import React from "react";
import { CardSuit } from "../../services/game/GameManager";
import './CurrentDealInfo.css';

interface CurrentDealInfoProps {
    dealNumber: number,
    dealId: string,
    step?: string,
    trumpSuit?: CardSuit
}

export class CurrentDealInfo extends React.Component<CurrentDealInfoProps> {

    render() {

        return (
            <div id="deal-info">
                <div>
                    <label>Deal #</label><input type="text" readOnly={true} value={this.props.dealNumber} />
                </div>
                <div>
                    {this.props.step && <label> Deal step: {this.props.step}</label>}
                </div>
                <div>
                    {this.props.trumpSuit && <label> Deal trump : {this.props.trumpSuit.display}</label>}
                </div>
            </div>
        )

    }

}