import { render, screen } from '@testing-library/react';
import PlayableCard from "./PlayableCard";

test('Clickable', () => {
    const result = render(<PlayableCard cardImage={"AS"} />)
    screen.queryByRole
});