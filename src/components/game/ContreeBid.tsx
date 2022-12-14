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
        let bidSuit = this.props.bidSuit;
        return (
            <div className={"bid"}>
                <p className={"bidValue"}>Bid: {this.props.bidValueDisplay } { bidSuit === null ? '' : bidSuit }</p>
            </div>
        );
    }

}