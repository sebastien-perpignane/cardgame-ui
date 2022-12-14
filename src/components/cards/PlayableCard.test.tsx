import {render, fireEvent, screen} from '@testing-library/react';
import {PlayableCard} from "./PlayableCard";
import {CardModel} from "./Card";
//import {PlayableCard} from "./PlayableCard";

test('Clickable', () => {

    const spy = jest.fn();

    const card: CardModel = {rank:"8", suit:"H", display:"8H", name:"EIGHT_HEART"}
    render(<PlayableCard gameId={'moncul'} card={card} className={"coucou"} clickHandler={spy} playable={true} />)

    fireEvent.click(screen.getByAltText(/card/i));

    expect(spy).toHaveBeenCalled();

});