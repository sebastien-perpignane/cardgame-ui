import { render } from '@testing-library/react';
import {PlayableCard} from "./PlayableCard";
import {CardModel} from "./Card";
//import {PlayableCard} from "./PlayableCard";

test('Clickable', () => {
    const card: CardModel = {rank:"8", suit:"H", display:"8H", name:"EIGHT_HEART"}
    render(<PlayableCard card={card} className={"coucou"} clickHandler={() => {}} />)

    // TODO

});