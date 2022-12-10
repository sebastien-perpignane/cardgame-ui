import * as React from "react";
import SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import {Player, PlayerModel} from "./Player";
import {PlayerHand} from "./PlayerHand";
import {CardModel} from "./Card";
import {BidModel} from "./ContreeBid";
import {BidTurnEventData, BidValue, GameManager, PlacedBidEventData, PlayTurnEventData} from "./GameManager";
import {CSSProperties} from "react";
import 'bootstrap';

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
    hand: HandCardModel,
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
    allowedBids: BidValue[]
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
        this.gameManager = new GameManager();
        this.state = {
            gameId: null,
            players: [],
            localPlayerName: '',
            localPlayerHand: [],
            localPlayerState: null,
            allowedBids: [],
            team1Score: 0,
            team2Score: 0,
            maxScore: 1000
        };
        this.startNewGame = this.startNewGame.bind(this);
        this.handlePlayerNameChange = this.handlePlayerNameChange.bind(this);
    }

    setLocalPlayerHand(hand: HandCardModel[]) {
        this.setState({
            localPlayerHand: hand
        })
    }

    updateLocalPlayerHand(handCards: HandCardModel[]) {

        this.setState({
           localPlayerHand: handCards
        });

    }

    componentDidMount() {

        //stompClient.debug = function(str) {};
        this.stompClient.connect({}, function (frame) {
            //this.stompClient.setConnected(true);
            console.log('Connected: ' + frame);
        });
    }

    async createGame() {
        const response = await fetch("http://localhost:8080/contree/game/create", {method: 'POST', mode: "cors"})
        return response.text();
    }

    async subscribeToGame(gameId: string) {
        //let localClient = this.stompClient;
        this.stompClient.subscribe('/topic/game/' + gameId, (message: Stomp.Message) => {
            let event = JSON.parse(message.body);
            let eventData = event.eventData;

            if (typeof eventData === 'string' || eventData instanceof String) {
                console.log('string event data ' + eventData)
            }
            else {
                switch(event.type) {
                    case 'PLAY_TURN':
                        let playTurnEventData = event.eventData as PlayTurnEventData
                        this.gameManager.managePlayTurn(this, playTurnEventData);
                        break
                    case 'BID_TURN':
                        //manageBidTurn(event)
                        let bidTurnData = event.eventData as BidTurnEventData
                        this.gameManager.manageBidTurn(this, bidTurnData);
                        break
                    case 'PLACED_BID':
                        let placedBidData = event.eventData as PlacedBidEventData
                        this.gameManager.managePlacedBid(this, placedBidData);
                        break;
                    case 'DEAL_OVER':

                        break;
                    default:
                        let eventDataAsStr = JSON.stringify(eventData);
                        console.log('default event type ' + eventDataAsStr)
                        //displayPlayerMessage(eventDataAsStr);
                }
            }
            return;
        })
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
        this.setState({gameId: gameId})
        await this.subscribeToGame(gameId);
        let gameModel = await this.joinGame(gameId);

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

    render() {

        /*let card1: CardModel = {
            rank: "8",
            suit: "HEARTS",
            display: "8H",
            name: "EIGHT_HEART"
        }

        let card2: CardModel = {
            rank: "JACK",
            suit: "HEARTS",
            display: "JH",
            name: "JACK_HEART"
        }

        let card3: CardModel = {
            rank: "ACE",
            suit: "SPADES",
            display: "AS",
            name: "ACE_SPADE"
        }

        let playerHandCards: CardModel[] = [card1, card2, card3]*/

        return (
            <div>
                {this.state.gameId !== null && <h1>Game ID : {this.state.gameId}</h1>}

                <div className={'row'}>

                    {this.state.players.length > 0 &&
                        <div className='col-md-6'>
                            <Player playerIndex={1} name={this.state.players[0].player.name}  lastBid={this.state.players[0].lastBid} />
                            <Player playerIndex={2} name={this.state.players[1].player.name}  lastBid={this.state.players[1].lastBid} />
                            <Player playerIndex={3} name={this.state.players[2].player.name}  lastBid={this.state.players[2].lastBid} />
                            <Player playerIndex={4} name={this.state.players[3].player.name}  lastBid={this.state.players[3].lastBid} />
                        </div>
                    }

                    {this.state.gameId !== null &&
                        <div id='game-score' className={'col-md-6'}>
                            <p>Team 1 : {this.state.team1Score}</p>
                            <p>Team 2 : {this.state.team2Score}</p>
                        </div>
                    }
                </div>

                {(this.state.gameId === null) && <label htmlFor='playerName'>Player name :</label> }
                {(this.state.gameId === null) && <input type="text" id="playerName" value={this.state.localPlayerName} onChange={this.handlePlayerNameChange} />}
                {(this.state.gameId === null) && <button onClick={this.startNewGame}>Start new game</button>}

                {(this.state.localPlayerHand && this.state.gameId !== null ) && <PlayerHand gameId={this.state.gameId} handCards={this.state.localPlayerHand} />}
                {this.state.gameId != null && <SelectBidComponent gameId={this.state.gameId} playerName={this.state.localPlayerName} allowedBids={this.state.allowedBids} /> }
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
            return <option value={bv.name}>{bv.display}</option>
        });

        let bidSuitStyle: CSSProperties = {fontSize: '32pt'}
        let bidValueStyle: CSSProperties = {fontSize: '32pt', width:'100%'}

        if (this.props.allowedBids.length > 0) {
            return (

                    <div id="select-bid" className='row'>
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
                        <button id='place-bid' onClick={ () => this.handlePlaceBid() }>Place a fucking bid</button>
                    </div>
            );
        }

        return (<div id="select-bid"></div>)
    }

}