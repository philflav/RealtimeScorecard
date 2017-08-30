import React from "react"; 

import {Panel, Well, Button} from 'react-bootstrap'

import fire from '../fire.js';
 
var dbRefComps = fire.database().ref().child('comp');
var dbRefPlayers = fire.database().ref().child('player');

var selCompName = ''
var players = [] //array of competition record objects

var link

export default class Draw extends React.Component {
    constructor(props){
        super(props)
        selCompName='The draw for '+this.props.match.params.compName

        link='/'+this.props.match.params.compName
    }

    componentWillMount(){

        //get competion players

        var dbRefComp = dbRefComps.orderByChild('name').equalTo(this.props.match.params.compName);

        dbRefComp.once('value').then(snap => {
            
                    snap.forEach((child) => { 
                        var dbRefPlayer= dbRefPlayers.orderByChild('player_id').equalTo(child.val().player_id);
                        dbRefPlayer.once('value').then(snap =>{
                            snap.forEach((child1) => {
                                players.push({competitorRef: child.ref, player_id: child.val().player_id, draw: child.val().draw, playerName: child1.val().forename+' '+child1.val().surname})
                                if(child.val().draw){
                                var selectedButton = document.getElementById(child.val().draw);
                                selectedButton.setAttribute('disabled', true)
                                selectedButton.innerHTML= child1.val().forename +' '+ child1.val().surname+' drew '+ child.val().draw
                                }
                                })
                            })
                        })
                    })                 
                    console.log(players)
                

        //test for draw already performed
        //if yes simply display the draw 

        //if no do the draw and update the competion details

    }

    handleClick (i,event) {
        var selectedButton = document.getElementById(i);
        selectedButton.setAttribute('disabled', true)
        selectedButton.innerHTML= i + ' not drawn'   
    }


    
    render () {
        var nums = [1,2,3,4,5,6,7,8,9,10,11,12]
        var ranNums = []
        var i = nums.length
        var j = 0
    
            while (i--) {
                j = Math.floor(Math.random() * (i+1));
                ranNums.push(nums[j]);
                nums.splice(j,1);
    }
        var items = ranNums.map(function(i) {
            return (
               
                <Button id={i} bsStyle="success" bsSize="large" onClick={this.handleClick.bind(this, i)} block >
                  ????
                </Button>
              
                
                );
        }, this);

        return (
            <div>
                 <Panel bsStyle="primary" header= {selCompName}>
                 <Button bsStyle="info" href={link}>Go to Teams/Groups</Button>
                 <Well>
                 {items}
                 </Well>
                 </Panel>

            </div>

        );
    }	
    
}

	


