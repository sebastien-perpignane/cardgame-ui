export interface CardModel {
    rank: string,
    suit: string,
    display: string,
    name: string
}

export interface HandCardModel {
    card: CardModel,
    playable: boolean
}
