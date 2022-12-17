import React, {CSSProperties} from "react";
import {BidValue} from "../../services/game/GameManager";
import 'bootstrap';

interface SelectBidProps {
    gameId: string,
    playerName: string,
    allowedBids: BidValue[]
}

interface SelectBidState {
    bidValue: string,
    bidSuit: string | null
}

export class SelectBid extends React.Component<SelectBidProps, SelectBidState> {

    API_URL = process.env.REACT_APP_API_URL_ROOT

    constructor(props: SelectBidProps) {
        super(props);
        this.handlePlaceBid = this.handlePlaceBid.bind(this)
        this.state = {
            bidValue: 'PASS',
            bidSuit: 'DIAMONDS'
        }
    }

    handlePass() {
        this.placeBid('PASS', null)
    }

    handlePlaceBid() {
        this.placeBid(this.state.bidValue, this.state.bidSuit)
    }

    placeBid(bidValue: string, bidSuit: string | null) {
        fetch(
                this.API_URL + '/contree/game/' +  this.props.gameId + '/place-bid',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        playerName: this.props.playerName,
                        bidValue: bidValue,
                        cardSuit: bidSuit
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

    handleBidSuitChange(bidSuit: string | null) {
        this.setState({
            bidSuit: bidSuit
        })
    }

    render() {

        if (this.props.allowedBids.length === 0) {
            return null;
        }

        const options = this.props.allowedBids.filter(bv => bv.name !== 'PASS').map(bv => {
            return <option value={bv.name} key={bv.name}>{bv.display}</option>
        });

        let bidSuitStyle: CSSProperties = {fontSize: '32pt'}
        let bidValueStyle: CSSProperties = {fontSize: '32pt', width:'100%'}

        if (this.props.allowedBids.length > 0) {
            return (
                <div id="select-bid-container">

                    bid value : {this.state.bidValue} ; bid suit : {this.state.bidSuit}

                    <div id="select-bid" className='row'>

                        <div className='col-md-1'>
                            <label htmlFor="place-pass-bid">Pass</label>
                            <button id='place-pass-bid' onClick={ () => this.handlePass() } style={{width: '100%'}} className='btn btn-outline-primary'>Pass</button>
                        </div>

                        <div className="form-group col-md-6">
                            <label htmlFor="bid-value">Bid value</label>
                            <select name={'bid-value'} className="form-control" style={bidValueStyle} onChange={ (e) => this.handleBidValueChange(e.target.value) }>
                                {options}
                            </select>
                        </div>
                        <div className="form-group col-md-5">
                            <label htmlFor="bid-suit">Bid suit</label>
                            <select id="bid-suit" className="form-control" style={bidSuitStyle} onChange={(e) => this.handleBidSuitChange(e.target.value)}>
                                <option value="DIAMONDS">♦</option>
                                <option value="HEARTS">♥</option>
                                <option value="SPADES">♠</option>
                                <option value="CLUBS">♣</option>
                            </select>
                        </div>
                        
                    </div>
                    <div id='place-bid-container' className='row'>
                        <div className="col" style={{width: '100%'}}>
                            <button id='place-bid' 
                                    onClick={ () => this.handlePlaceBid() } 
                                    className='btn btn-outline-primary' 
                                    style={{width: '100%'}}>
                                Place a bid
                            </button>
                        </div>
                    </div>

                </div>
            );
        }

        return (<div id="select-bid"></div>)
    }


    componentDidUpdate(prevProps: Readonly<SelectBidProps>, prevState: Readonly<SelectBidState>, snapshot?: any) {
        // FIXME ugly solution to reinit state
        if (this.props.allowedBids.length !== prevProps.allowedBids.length ) {
            this.setState({
                bidValue: 'EIGHTY',
                bidSuit: 'DIAMONDS'
            });
        }
    }
}