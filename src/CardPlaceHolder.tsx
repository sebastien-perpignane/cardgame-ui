
import * as React from 'react';
import Card, {CardModel} from "./Card";

export class CardPlaceHolder extends React.Component {

    fakeCard: CardModel = {name: 'fake', rank: 'blue_bac', suit: 'k', display: 'fake'}

    render() {

        return (
            <Card className={''} card={this.fakeCard}  />
        );

    }

}