
import * as React from 'react';
import { CardModel } from '../../services/card/CardModels';
import Card from './Card';

export class CardPlaceHolder extends React.Component {

    fakeCard: CardModel = {name: 'fake', rank: 'blue_bac', suit: 'k', display: 'fake'}

    render() {

        return (
            <Card className={''} card={this.fakeCard} cardSize='small'  />
        );

    }

}