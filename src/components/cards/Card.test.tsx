import { fireEvent, render, screen } from '@testing-library/react';
import { CardModel } from '../../services/card/CardModels';
import Card from "./Card";

test('renders card image', () => {
    const card: CardModel = {rank:"8", suit:"H", display:"8H", name:"EIGHT_HEART"};

    render(<Card card={card} className={'coucou'} clickHandler={() => {}} />);
    const cardElement = screen.getByAltText(/card/i);
    expect(cardElement).toBeInTheDocument();
});

test('Wrapping div can be clicked when clickHandler is passed', () => {

    const card: CardModel = {rank:"8", suit:"H", display:"8H", name:"EIGHT_HEART"};

    let spy = jest.fn()

    const result = render(<Card card={card} clickHandler={spy} />);
    const wrappingDiv = result.container.querySelector('#c8H')

    if (wrappingDiv) {
        fireEvent.click(wrappingDiv)
        expect(wrappingDiv).toBeInTheDocument()
        expect(spy).toBeCalled()
    }
    else {
        fail('wrapping div should not be null')
    }

});
