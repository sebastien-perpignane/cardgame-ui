import {render, fireEvent, screen} from '@testing-library/react';
import { CardModel } from '../../services/card/CardModels';
import {PlayableCard} from "./PlayableCard";
//import {PlayableCard} from "./PlayableCard";

test('Clickable', () => {

    const spy = jest.fn();

    const card: CardModel = {rank:"8", suit:"H", display:"8H", name:"EIGHT_HEART"}
    render(<PlayableCard gameId={'game-id'} card={card} clickHandler={spy} playable={true} />)

    let img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img.onclick).toBeDefined()

});