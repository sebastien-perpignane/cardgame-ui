import * as React from "react";
import SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import {Player, PlayerModel} from "./Player";
import {PlayerHand} from "./PlayerHand";
import {CardModel} from "./Card";
import {BidModel} from "./ContreeBid";
import {GameManager} from "./GameManager";

interface GameModel {
    gameId: string,
    players: string[],
    team1Score: number,
    team2Score: number,
    maxScore: number
}

interface GameProps {

}

interface PlayerState {
    player: PlayerModel,
    lastBid?: BidModel,
    lastPlayedCard?: CardModel
}

interface GameState {
    gameId: string | null,
    players: PlayerState[],
    team1Score?: number,
    team2Score?: number,
    maxScore?: number,
    localPlayerName: string,
    localPlayerHand?: CardModel[]
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
            localPlayerName: ''
        };
        this.startNewGame = this.startNewGame.bind(this);
        this.handlePlayerNameChange = this.handlePlayerNameChange.bind(this);
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
                        //managePlayTurn(event)
                        console.log("play turn:" + eventData)
                        break
                    case 'BID_TURN':
                        //manageBidTurn(event)
                        this.gameManager.manageBidTurn(this, event);
                        console.log("bid turn:" + eventData)
                        break
                    case 'PLACED_BID':
                        console.log("placed bid :" + eventData)
                        //managePlacedBid(event);
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
              player: {name: playerName}
            };
        });

        this.setState({
            gameId: gameModel.gameId,
            players: this.state.players.concat(playerStates),
            team1Score: gameModel.team1Score,
            team2Score: gameModel.team2Score,
            maxScore: gameModel.maxScore,
            localPlayerName: ''
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
                <h1>Game ID : {this.state.gameId}</h1>

                {this.state.players.length > 0 &&
                    <div>
                        <Player playerIndex={1} name={this.state.players[0].player.name}  />
                        <Player playerIndex={2} name={this.state.players[1].player.name}  />
                        <Player playerIndex={3} name={this.state.players[2].player.name}  />
                        <Player playerIndex={4} name={this.state.players[3].player.name}  />
                    </div>
                }

                {(this.state.gameId === null) && <label htmlFor='playerName'>Player name :</label> }
                {(this.state.gameId === null) && <input type="text" id="playerName" value={this.state.localPlayerName} onChange={this.handlePlayerNameChange} />}
                {(this.state.gameId === null) && <button onClick={this.startNewGame}>Start new game</button>}

                {this.state.localPlayerHand && <PlayerHand cardImages={this.state.localPlayerHand} />}
            </div>
        );

    }

}