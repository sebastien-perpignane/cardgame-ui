import React from "react";

export class MaClasseBidon extends React.Component {

    monClientStomp

    constructor(props) {
        super(props)
        this.monClientStomp = initMyClient()
    }

    maMethode() {
        fetch('http://localhost:8080').then((response) => response.json())
            .then ((json) => {
                this.monClientStomp.subscribe('/topic/game' + json.gameId)
            });
    }

}