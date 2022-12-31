import Card, {CardProps} from "./Card";
import * as React from "react";
import { CardModel } from "../../services/card/CardModels";

interface PlayableCardProps extends CardProps {
    playable: boolean,
    gameId: string,
    importantCardsFilter?: (cm: CardModel) => boolean,
    veryImportantCardsFilter?: (cm: CardModel) => boolean
}

export class PlayableCard extends React.Component<PlayableCardProps> {
    

    API_URL = process.env.REACT_APP_API_URL_ROOT

    // TODO test if it is needed
    public static defaultProps = {
        importantCardsFilter: (cm: CardModel) => { return false },
        veryImportantCardsFilter: (cm: CardModel) => { return false }
    }

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

    // TODO pass callback as prop, to avoid passing gameId
    playCard() {
        fetch(
            this.API_URL + '/contree/game/' + this.props.gameId + '/play-card',
            {
                method: 'POST',
                body: JSON.stringify({
                    'playerName' : 'Seb',
                    'card': this.props.card.name
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: "include"

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

        let importantFilter = this.props.importantCardsFilter === undefined ? () => { return true} : this.props.importantCardsFilter;
        let veryImportantFilter = this.props.veryImportantCardsFilter === undefined ? () => { return true} : this.props.veryImportantCardsFilter;


        if (importantFilter(this.props.card)) {
            highlightStyle='important-card'
        }
        if (veryImportantFilter(this.props.card)) {
            highlightStyle='very-important-card'
        }

        return (
            <Card card={this.props.card} className={this.props.className + ' ' + playableStyle + ' ' + highlightStyle} clickHandler={ this.handlePlayCard } />
        );
    }
}
