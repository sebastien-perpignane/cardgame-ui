import React from "react";

export interface BidModel {
    bidValueName: string,
    bidValueExpectedScore?: number,
    bidValueSuitRequired:boolean,
    bidValueDisplay: string,
    bidSuit?: string
}

interface BidProps {
    bidValueDisplay: string,
    bidSuit?: string

}

export class ContreeBid extends React.Component<BidProps> {

    render() {
        return (

            <div className={"bid"}>
                <label className={"bidValue"}>Value: {this.props.bidValueDisplay}</label>
                { this.props.bidSuit && <label className={"bidSuit"}>Suit: {this.props.bidSuit}</label> }
            </div>
        );
    }

}