import React from "react";

export interface BidModel {
    bidValueName: string,
    bidValueExpectedScore?: number,
    bidValueSuitRequired:boolean,
    bidValueDisplay: string,
    bidSuit: string | null
}

interface BidProps {
    bidValueDisplay: string,
    bidSuit: string | null

}

export class ContreeBid extends React.Component<BidProps> {

    render() {
        return (

            <div className={"bid"}>
                <p className={"bidValue"}>Value: {this.props.bidValueDisplay}</p>
                { this.props.bidSuit && <p className={"bidSuit"}>Suit: {this.props.bidSuit}</p> }
            </div>
        );
    }

}