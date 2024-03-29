import * as React from "react";
import SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import {PlayerHand} from "../players/PlayerHand";
import {BidModel} from "./ContreeBid";
import {BidValue, CardSuit, GameManager} from "../../services/game/GameManager";
import 'bootstrap';
import {Players} from "../players/Players";
import { Trick } from "./Trick";
import {SelectBid} from "./SelectBid";
import { CardModel, HandCardModel } from "../../services/card/CardModels";
import { FullPlayerModel, PlayerModel } from "../../services/player/PlayerModels";
import { GameModel } from "../../services/game/GameModels";

import './Game.css';
import { MyFetch } from "../../services/tech/MyFetch";
import { CurrentDealInfo } from "./CurrentDealInfo";

interface JoinGameResponse {
    playerId: string,
    gameState: GameModel,
    playerModel: FullPlayerModel
}

interface StartGameResponse {
    gameState: GameModel
}

interface GameProps {

}

enum PlayerStatus {
    BIDING,
    PLAYING,
    WAITING
}

interface CreateGameResponse {
    gameId: string,
    playerId: string
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

export interface CurrentDealState {
    dealId: string,
    dealNumber: number,
    step?: string,
    trumpSuit?: CardSuit
}

interface PlayedCard {
    player: PlayerModel,
    card: CardModel
}

interface CurrentTrickState {
    trickId: string,
    playedCards: PlayedCard[]
}

interface GameState {

    selectedGameId?: string,
    selectableGameIds: string[]

    gameId: string | null,
    players: PlayerState[],
    team1Score: number,
    team2Score: number,
    maxScore: number,
    localPlayerName: string,
    localPlayerHand: HandCardModel[],
    localPlayerState: PlayerState | null,

    currentDealState?: CurrentDealState,
    currentTrickSate?: CurrentTrickState,

    allowedBids: BidValue[],
    lastTrickCards: CardModel[],
    importantCardsFilter?: (cm: CardModel) => boolean,
    veryImportantCardsFilter?:(cm: CardModel) => boolean,
    lastTrickWinner?: string
}

const newGameState = {
    gameId: null,
    players: [],
    localPlayerHand: [],
    localPlayerState: null,
    allowedBids: [],
    team1Score: 0,
    team2Score: 0,
    maxScore: 1000,
    lastTrickCards: [],
    selectableGameIds: []
}

const initGameState = Object.assign({localPlayerName: ''}, newGameState)

export class Game extends React.Component<GameProps, GameState> {

    API_URL = process.env.REACT_APP_API_URL_ROOT

    stompClient: Stomp.Client;
    gameManager: GameManager;
    myFetch: MyFetch


    constructor(props: GameProps) {
        super(props)

        this.myFetch = new MyFetch()

        let stompUrl = this.API_URL + "/stomp"
        let socket = new SockJS(stompUrl)
        this.stompClient = Stomp.over(socket)
        this.gameManager = new GameManager(this, this.stompClient)
        //stompClient.debug = function(str) {};
        this.stompClient.connect({}, (frame) => {
            console.log('Connected: ' + frame)
        });
        this.state = initGameState;
        this.startNewGame = this.startNewGame.bind(this)
        this.handlePlayerNameChange = this.handlePlayerNameChange.bind(this)
        this.updateStateWithGameModel = this.updateStateWithGameModel.bind(this)
    }

    setLocalPlayerHand(hand: HandCardModel[]) {
        this.setState({
            localPlayerHand: hand
        })
    }

    componentDidMount() {
        
        this.myFetch.get<string[]>('/contree/game/list').then(
            (gameIds) => {
                this.setState({
                    selectableGameIds: gameIds
                })

                if (gameIds.length > 0) {
                    this.setState({
                        selectedGameId: gameIds[0]
                    })
                }

            }

            
        );

    }

    restart() {
        this.setState(newGameState)
    }

    async createGame(playerName: string): Promise<CreateGameResponse> {
        
        return await fetch(
            this.API_URL + "/contree/game/create", 
            {method: 'POST', mode: "cors", credentials: "include", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({playerName: playerName})}
        ).then(response => {
            return response.json()
        }).then(data => {
            return data as CreateGameResponse
        })
    }

    async joinGame(gameId: string): Promise<JoinGameResponse> {

        let gameJoinUri = '/contree/game/' + gameId + '/join'
        return await this.myFetch.post(gameJoinUri, {playerName: this.state.localPlayerName})
    }

    async startGame(gameId: string): Promise<StartGameResponse> {

        let gameJoinUri = '/contree/game/' + gameId + '/start'
        return await this.myFetch.post<StartGameResponse>(gameJoinUri, {})
    }

    joinSpecificGame = (e: any) => {

        

        if (!this.state.selectedGameId) {
            alert("no game selected")
            return
        }

        let gameId = this.state.selectedGameId

        this.joinGame(this.state.selectedGameId).then(
            
            joinResponse => {

                this.gameManager.subscribeToGame(gameId, joinResponse.playerId);

                this.updateStateWithGameModel(joinResponse.gameState)
                this.setState({
                    localPlayerHand: joinResponse.playerModel.hand.map(cm => {return {card: cm, playable: false}})
                })
            }
        )
        
    }

    async startNewGame() {

        console.log("Player name when starting new game: " + this.state.localPlayerName)

        if (this.state.localPlayerName === undefined || this.state.localPlayerName === '') {

            alert("Please type a player name")
            return;
        }

        let createGameResponse = await this.createGame(this.state.localPlayerName)

        let gameId = createGameResponse.gameId;
        let playerId = createGameResponse.playerId

        //this.stompClient.send('/app/hello/' + gameId, {}, JSON.stringify({message: 'Subscribe me to the game', playerId: playerId}))
        
        //this.setState({gameId: gameId})
        this.gameManager.subscribeToGame(gameId, playerId);
        let startGameResponse = await this.startGame(gameId);
        let gameModel = startGameResponse.gameState

        this.updateStateWithGameModel(gameModel)
        
        /*
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
        */
    }

    private updateStateWithGameModel(gameModel: GameModel) {

        let playerStates: PlayerState[] = gameModel.players.map((playerName) => {
            return {
                player: {name: playerName},
                playerStatus: PlayerStatus.WAITING
            };
        });

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

    handleGameIdSelection = (e: any) => {
        this.setState( {
            selectedGameId: e.target.value
        })
    }

    render() {

        let selectGameOptions = this.state.selectableGameIds.map(gameId => <option value={gameId} key={gameId}>{gameId}</option>)

        return (

            <div id='game'>

                    {(this.state.gameId === null) &&
                    <div>
                        <div id='start-game-form'>
                            <label htmlFor='playerName'>Player name :</label>
                            <input type="text" id="playerName" value={this.state.localPlayerName} onChange={this.handlePlayerNameChange} />

                            

                            <button onClick={this.startNewGame} className='btn btn-outline-primary'>Start new game</button>
                        </div>
                        <div id="join-game-form">
                            <select id="select-game-id" value="{this.state.selectGameId}" onChange={this.handleGameIdSelection}>
                                {selectGameOptions}
                            </select>
                            <button onClick={this.joinSpecificGame} className='btn btn-outline-primary'>Join game</button>
                        </div>
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
                                {this.state.currentDealState && <CurrentDealInfo {...this.state.currentDealState} />}
                                <Trick cards={this.state.lastTrickCards} trumpSuit={{display:'', name:'HEARTS'}} />
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
