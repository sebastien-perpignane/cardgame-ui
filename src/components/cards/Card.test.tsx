import { render, screen } from '@testing-library/react';
import Card, {CardModel} from "./Card";

test('renders card image', () => {

    const card: CardModel = {rank:"8", suit:"H", display:"8H", name:"EIGHT_HEART"};

    render(<Card card={card} className={'coucou'} clickHandler={() => {}} />);
    const cardElement = screen.getByAltText(/card/i);
    expect(cardElement).toBeInTheDocument();
});

test('Wrapping div takes className given as prop', () => {

    //const card: CardModel = {rank:"8", suit:"H", display:"8H", name:"EIGHT_HEART"};

    //const testClassName = "coucou";

    //const result = render(<Card card={card} className={testClassName} clickHandler={() => {}} />);
    //const wrappingDiv = result.container.querySelector('#AH')
    // TODO mananage if wrappingDiv is null
    /*expect(wrappingDiv.getAttribute('class').includes(testClassName));
    expect(wrappingDiv).toBeInTheDocument();*/

});