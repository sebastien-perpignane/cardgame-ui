import Card, {CardProps} from "./Card";
import * as React from "react";

export class PlayableCard extends React.Component<CardProps> {
    constructor(props: CardProps) {
        super(props);
        this.playCard = this.playCard.bind(this);
    }

    playCard(): void {
        console.log("Card " + this.props.card.display + ' played')
    }

    render() {
        return (
            <Card card={this.props.card} className={this.props.className} clickHandler={this.playCard} />
        );
    }
}
