import Card, {CardProps} from "./Card";
import * as React from "react";

interface PlayableCardProps extends CardProps {
    playable: boolean,
    gameId: string
}

export class PlayableCard extends React.Component<PlayableCardProps> {
    constructor(props: PlayableCardProps) {
        super(props);
        this.handlePlayCard = this.handlePlayCard.bind(this);
    }

    handlePlayCard(): void {
        if (this.props.playable) {
            this.playCard()
        }
        else {
            console.log("Card " + this.props.card.display + " not playable");
        }

    }

    playCard() {
        fetch(
            'http://localhost:8080/contree/game/' + this.props.gameId + '/play-card',
            {
                method: 'POST',
                body: JSON.stringify({
                    'playerName' : 'Seb',
                    'card': this.props.card.name
                }),
                headers: {
                    'Content-Type': 'application/json'
                }

            }
        ).then(response => {
            if (response.status / 100 !== 2) {
                console.error('playCard: ça a foiré gros')
            }
        })
    }



    render() {

        let playableStyle: string = "playable-" + this.props.playable

        let highlightStyle = '';
        if (this.props.card.rank === 'J' || this.props.card.rank === '9') {
            highlightStyle='very-important-card'
        }

        if (this.props.card.rank === 'A') {
            highlightStyle='important-card'
        }

        return (
            <Card card={this.props.card} className={this.props.className + ' ' + playableStyle + ' ' + highlightStyle} clickHandler={ this.handlePlayCard } />
        );
    }
}
