import * as React from 'react';
import { PlayerState } from '../game/Game';

import {Player} from './Player';

export interface PlayersProps {
    players: PlayerState[]
}

export class Players extends React.Component<PlayersProps> {


    render() {

        let players = this.props.players

        if (players.length === 0) {
            return (<div></div>)
        }

        let player1 = players[0]
        let player2 = players[1]
        let player3 = players[2]
        let player4 = players[3]

        return (
            <div id='players'>
                <div id='players-team1' className='row'>
                    <div className='col-sm-6'>
                        <Player playerIndex={1} name={player1.player.name} lastBid={player1.lastBid} lastPlayedCard={player1.lastPlayedCard} />
                    </div>
                    <div className='col-sm-6'>
                        <Player playerIndex={3} name={player3.player.name} lastBid={player3.lastBid} lastPlayedCard={player3.lastPlayedCard} />
                    </div>
                </div>
                <div id='players-team2' className='row'>
                    <div className='col-sm-6'>
                        <Player playerIndex={2} name={player2.player.name} lastBid={player2.lastBid} lastPlayedCard={player2.lastPlayedCard} />
                    </div>
                    <div className='col-sm-6'>
                        <Player playerIndex={4} name={player4.player.name} lastBid={player4.lastBid} lastPlayedCard={player4.lastPlayedCard} />
                    </div>
                </div>
            </div>
        );
    }

}
