import { CardModel } from "../card/CardModels"

export interface PlayerModel {
    name: string,
    team?: string
}

export interface FullPlayerModel extends PlayerModel {
    hand: CardModel[]
}