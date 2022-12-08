import { render, screen } from '@testing-library/react';
import Card from "./Card";

test('renders card image', () => {
    render(<Card card="AH" />);
    const cardElement = screen.getByAltText(/card/i);
    expect(cardElement).toBeInTheDocument();
});

test('Wrapping div takes className given as prop', () => {

    const testClassName = "coucou";

    const result = render(<Card card="AH" className={testClassName} />);
    const wrappingDiv = result.container.querySelector('#AH')
    expect(wrappingDiv.getAttribute('class').includes(testClassName));
    expect(wrappingDiv).toBeInTheDocument();

});