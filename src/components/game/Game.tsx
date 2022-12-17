import * as React from "react";
import SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import {PlayerHand} from "../players/PlayerHand";
import {BidModel} from "./ContreeBid";
import {BidValue, GameManager} from "../../services/game/GameManager";
import 'bootstrap';
import {Players} from "../players/Players";
import { Trick } from "./Trick";
import {SelectBid} from "./SelectBid";
import { CardModel, HandCardModel } from "../../services/card/CardModels";
import { PlayerModel } from "../../services/player/PlayerModels";
import { GameModel } from "../../services/game/GameModels";

import './Game.css';



interface GameProps {

}

enum PlayerStatus {
    BIDING,
    PLAYING,
    WAITING
}

export interface PlayerState {
    player: PlayerModel,
    playerStatus: PlayerStatus,
    lastBid?: BidModel,
    lastPlayedCard?: CardModel
}

interface LocalPlayerState extends PlayerState {
    hand: HandCardModel[],
    allowedBidValues: BidValue[]
}

interface GameState {
    gameId: string | null,
    players: PlayerState[],
    team1Score: number,
    team2Score: number,
    maxScore: number,
    localPlayerName: string,
    localPlayerHand: HandCardModel[],
    localPlayerState: PlayerState | null,
    allowedBids: BidValue[],
    lastTrickCards: CardModel[],
    importantCardsFilter?: (cm: CardModel) => boolean,
    veryImportantCardsFilter?:(cm: CardModel) => boolean
}

export class Game extends React.Component<GameProps, GameState> {

    API_URL = process.env.REACT_APP_API_URL_ROOT

    stompClient: Stomp.Client;
    gameManager: GameManager;


    constructor(props: GameProps) {
        super(props);

        let stompUrl = this.API_URL + "/stomp"
        //let socket = new SockJS('http://localhost:8080/stomp');
        let socket = new SockJS(stompUrl);
        this.stompClient = Stomp.over(socket);
        this.gameManager = new GameManager(this, this.stompClient);
        //stompClient.debug = function(str) {};
        this.stompClient.connect({}, function (frame) {
            //this.stompClient.setConnected(true);
            console.log('Connected: ' + frame);
        });
        this.state = {
            gameId: null,
            players: [],
            localPlayerName: '',
            localPlayerHand: [],
            localPlayerState: null,
            allowedBids: [],
            team1Score: 0,
            team2Score: 0,
            maxScore: 1000,
            lastTrickCards: []
        };
        this.startNewGame = this.startNewGame.bind(this);
        this.handlePlayerNameChange = this.handlePlayerNameChange.bind(this);
    }

    setLocalPlayerHand(hand: HandCardModel[]) {
        this.setState({
            localPlayerHand: hand
        })
    }

    componentDidMount() {

        
    }

    async createGame() {
        
        const response = await fetch(
            this.API_URL + "/contree/game/create", 
            {method: 'POST', mode: "cors"}
            )
        return response.text();
    }

    async joinGame(gameId: string): Promise<GameModel> {

        return await fetch   (
            this.API_URL + '/contree/game/' + gameId + '/join',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({playerName : this.state.localPlayerName})
            }
        ).then((response) => {
            return response.json() as Promise<GameModel>
        })
            .then ((data) => {
                return data
            });
    }

    async startNewGame() {

        console.log("Player name when starting new game: " + this.state.localPlayerName)

        if (this.state.localPlayerName === undefined || this.state.localPlayerName === '') {

            alert("Please type a player name")
            return;
        }

        let gameId = await this.createGame();
        //this.setState({gameId: gameId})
        await this.gameManager.subscribeToGame(gameId);
        let gameModel = await this.joinGame(gameId);

        let playerStates: PlayerState[] = gameModel.players.map((playerName) => {
            return {
                player: {name: playerName},
                playerStatus: PlayerStatus.WAITING
            };
        });

        console.log('playerStates on start game : ' + playerStates)

        this.setState({
            gameId: gameModel.gameId,
            players: playerStates,
            team1Score: gameModel.team1Score,
            team2Score: gameModel.team2Score,
            maxScore: gameModel.maxScore,
            localPlayerState: {
                player: {name: this.state.localPlayerName},
                playerStatus: PlayerStatus.WAITING
            }
        });
    }

    handlePlayerNameChange(e: any) {
        this.setState({
            localPlayerName: e.target.value
        })
    }

    render() {

        return (
            <div id='game'>


                    {(this.state.gameId === null) &&
                    <div id='start-game-form'>
                        <label htmlFor='playerName'>Player name :</label>
                        <input type="text" id="playerName" value={this.state.localPlayerName} onChange={this.handlePlayerNameChange} />
                        <button onClick={this.startNewGame} className='btn btn-outline-primary'>Start new game</button>
                    </div>
                    }


                {this.state.gameId !== null &&
                    <div id='game-main'>
                        <p>Game ID : {this.state.gameId}</p>
                        <div id='info' className='row'>

                            <div id='players-container' className='col-md-4'>
                            <Players players={this.state.players} />
                            </div>

                            <div id='last-trick' className="col-md-4">
                                <Trick cards={this.state.lastTrickCards} trump={{display:'', name:'HEARTS'}} />
                            </div>

                            <div id='game-score' className={'col-md-4'}>
                                <p>Game score</p>
                                <p>Team 1 : {this.state.team1Score}</p>
                                <p>Team 2 : {this.state.team2Score}</p>
                            </div>

                        </div>
                    </div>
                }

                <div id='local-player-panel'>
                    {(this.state.localPlayerHand && this.state.gameId !== null ) && <PlayerHand importantFilter={this.state.importantCardsFilter} veryImportantFilter={this.state.veryImportantCardsFilter} gameId={this.state.gameId} handCards={this.state.localPlayerHand} />}
                    {this.state.gameId != null && <SelectBid gameId={this.state.gameId} playerName={this.state.localPlayerName} allowedBids={this.state.allowedBids} /> }
                </div>

            </div>
        );

    }

}
