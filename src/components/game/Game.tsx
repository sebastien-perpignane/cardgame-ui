import * as React from "react";
import SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import {PlayerModel} from "../players/Player";
import {PlayerHand} from "../players/PlayerHand";
import {BidModel} from "./ContreeBid";
import {BidValue, GameManager} from "../../services/GameManager";
import {CSSProperties} from "react";
import 'bootstrap';
import {Players} from "../players/Players";
import { CardModel } from "../cards/Card";
import { Trick } from "./Trick";
import {SelectBid} from "./SelectBid";

interface GameModel {
    gameId: string,
    players: string[],
    team1Score: number,
    team2Score: number,
    maxScore: number
}

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
    lastTrickCards: CardModel[]
}

export interface HandCardModel {
    card: CardModel,
    playable: boolean
}

export class Game extends React.Component<GameProps, GameState> {

    stompClient: Stomp.Client;
    gameManager: GameManager;


    constructor(props: GameProps) {
        super(props);
        let socket = new SockJS('http://localhost:8080/stomp');
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
        const response = await fetch("http://localhost:8080/contree/game/create", {method: 'POST', mode: "cors"})
        return response.text();
    }

    async joinGame(gameId: string): Promise<GameModel> {
        return await fetch   (
            'http://localhost:8080/contree/game/' + gameId + '/join',
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
                    {(this.state.localPlayerHand && this.state.gameId !== null ) && <PlayerHand gameId={this.state.gameId} handCards={this.state.localPlayerHand} />}
                    {this.state.gameId != null && <SelectBid gameId={this.state.gameId} playerName={this.state.localPlayerName} allowedBids={this.state.allowedBids} /> }
                </div>

            </div>
        );

    }

}

interface SelectBidProps {
    gameId: string,
    playerName: string,
    allowedBids: BidValue[]
}

interface SelectBidState {
    bidValue: string,
    bidSuit: string
}


class SelectBidComponent extends React.Component<SelectBidProps, SelectBidState> {

    constructor(props: SelectBidProps) {
        super(props);
        this.handlePlaceBid = this.handlePlaceBid.bind(this)
        this.state = {
            bidValue: 'PASS',
            bidSuit: 'DIAMONDS'
        }
    }

    handlePlaceBid() {
        fetch(
            'http://localhost:8080/contree/game/' +  this.props.gameId + '/place-bid',
            {
                method: 'POST',
                body: JSON.stringify({
                    playerName: this.props.playerName,
                    bidValue: this.state.bidValue,
                    cardSuit: this.state.bidSuit
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ).then(response => {
            if (response.status / 100 !== 2) {
                console.error('placeBid: ça a foiré gros')
            }
        });
    }

    handleBidValueChange(bidValue: string) {
        this.setState({
            bidValue: bidValue
        })
    }

    handleBidSuitChange(bidSuit: string) {
        this.setState({
            bidSuit: bidSuit
        })
    }

    render() {

        const options = this.props.allowedBids.map(bv => {
            return <option value={bv.name} key={bv.name}>{bv.display}</option>
        });

        let bidSuitStyle: CSSProperties = {fontSize: '32pt'}
        let bidValueStyle: CSSProperties = {fontSize: '32pt', width:'100%'}

        if (this.props.allowedBids.length > 0) {
            return (

                    <div id="select-bid" className='row'>

                        <p>actual bid value: {this.state.bidValue}</p>

                        <div className="form-group col-md-6">
                            <label htmlFor="bid-value">Bid value</label>
                            <select name={'bid-value'} className="form-control" style={bidValueStyle} onChange={ (e) => this.handleBidValueChange(e.target.value) }>
                                {options}
                            </select>
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="bid-suit">Bid suit</label>
                            <select id="bid-suit" className="form-control" style={bidSuitStyle} onChange={(e) => this.handleBidSuitChange(e.target.value)}>
                                <option value="DIAMONDS">♦</option>
                                <option value="HEARTS">♥</option>
                                <option value="SPADES">♠</option>
                                <option value="CLUBS">♣</option>
                            </select>
                        </div>
                        <button id='place-bid' onClick={ () => this.handlePlaceBid() } className='btn btn-outline-primary'>Place a bid</button>
                    </div>
            );
        }

        return (<div id="select-bid"></div>)
    }


    componentDidUpdate(prevProps: Readonly<SelectBidProps>, prevState: Readonly<SelectBidState>, snapshot?: any) {
        // FIXME ugly solution to reinit state
        if (this.props.allowedBids.length !== prevProps.allowedBids.length ) {
            this.setState({
               bidValue: 'PASS',
               bidSuit: 'DIAMONDS'
            });
        }
    }
}