import React from "react"; 

import fire from '../fire.js';

import {Panel, Well, Row, Col, Button,  Glyphicon, Clearfix, MenuItem, Nav, NavDropdown} from 'react-bootstrap'

import stableford from '../functions/stableford.js'

import getplayerDetails from '../functions/getplayerDetails.js'

import PlayerProgress from './playerprogress.js'

var dbRefCourses = fire.database().ref().child('course');
var dbRefrtscores = fire.database().ref().child('rtscores');

var playerdbRef = fire.database().ref().child('rtscores/0');


var courseList = []
var menuItems

var playerList
var scorecards = []
var holescoreRefHistory =[]

var holes = []
var pars = []
var SIs = []

var history = []



export default class OnCourse extends React.Component {

    constructor(props){
    super(props)
    scorecards= []
    this.state= {playername: '',
                hcap: '',
                selectedCourseName: 'Felixstowe Ferry',
                holeNumber: 1,
                holePar: 4,
                holeSI: 12,
                holeStrokes: 4,
                holePts: 2,
                hist: '',
                total: 0,
                courses: [],
                scorecards: []
    }
    //get list of courses available
    dbRefCourses.on('value' ,snap =>{
        snap.forEach((child) => {
        courseList.push(child.val().name)
        this.setState({courses: courseList})
        })
       })

       


}

componentWillMount() {

    fire.auth().onAuthStateChanged(firebaseUser =>{
        if(firebaseUser) {
            getplayerDetails(firebaseUser.uid).then((success) => {
                    this.setState({playername: success.forename +' ' + success.surname,
                    hcap: success.c_hcap,
                    playerId: success.player_id
                })
            })            
        }
        else {
            alert('You must be signed in to perform this action')
        }
    })
    dbRefrtscores.on('child_changed', snap =>{
        console.log(snap.val())
        scorecards[snap.key]=snap.val()
        this.setState({
            scorecards: scorecards
        })
        playerList = []
        this.state.scorecards.forEach((card, index) => {
           playerList.push(<PlayerProgress name = {this.state.scorecards[index].playerName} holes={this.state.scorecards[index].lasthole}  total={this.state.scorecards[index].total} />)
    
        })
        this.forceUpdate()
    })  

        
}


componentDidMount() {


    
}



handleIncHole(strokes, points){
    var hole= this.state.holeNumber 
    var total = this.state.total + points
    playerdbRef.child('total').set(total)
    playerdbRef.child('lasthole').set(hole)
    var holescoreId= playerdbRef.child('holescore').push({holeNumber: hole, points: points, strokes: strokes})
    holescoreRefHistory.push(holescoreId.getKey())
    if(hole<18)hole++
    this.setState({holeNumber: hole, total: total, holePar: pars[hole], holeSI: SIs[hole]})
}
handleDecHole(points){
    var hole= this.state.holeNumber 
    var total = this.state.total - points
    var key=holescoreRefHistory.pop()
    playerdbRef.child('holescore/'+key).remove()
    if(hole>1)hole--
    this.setState({holeNumber: hole, total: total, holePar: pars[hole], holeSI: SIs[hole]})
    playerdbRef.child('lasthole').set(hole)
    playerdbRef.child('total').set(total)

}
handleClearHole(event){
        
        var last= history.pop()
        if(last){
        var n=last.search("/")
        var points=last.slice(n+1)
        this.setState({
                hist: history,
                holeStrokes: 0,
                holePts: points
            })
        this.handleDecHole(points)
        }
             
}
handleEagle(event){
    if(this.state.holeNumber<19){
        var strokes=this.state.holePar-2
        var pts= stableford(this.state.hcap, strokes, this.state.holePar, this.state.holeSI)
        if(strokes<1){strokes=1}
        history.push('['+this.state.holeNumber+ ']'+strokes+'/'+ pts +' ')
        this.setState({
         holeShots:strokes,
         holePts: pts,
         hist: history
     })
     this.handleIncHole(strokes, pts)

}
}
handleBirdie(event){
   if(this.state.holeNumber<19){
    var strokes=this.state.holePar-1
    if(strokes<1){strokes=1}
    var pts= stableford(this.state.hcap, strokes, this.state.holePar, this.state.holeSI)
    history.push('['+this.state.holeNumber+ ']'+strokes+'/'+ pts +' ')
    this.setState({
        holeStrokes:strokes,
        holePts: pts,
        hist: history
    })
    this.handleIncHole(strokes, pts)
}
}

handlePar(event){
   if(this.state.holeNumber<19){
    var strokes=this.state.holePar
    if(strokes<1){strokes=1}
    var pts= stableford(this.state.hcap, strokes, this.state.holePar, this.state.holeSI)
    history.push('['+this.state.holeNumber+ ']'+strokes+'/'+ pts +' ')
    this.setState({
        holeStrokes:strokes,
        holePts: pts,
        hist: history     
        

    })
    this.handleIncHole(strokes, pts)
    }
}
handleBogey(event){
   if(this.state.holeNumber<19){
    var strokes=this.state.holePar+1
    if(strokes<1){strokes=1}
    var pts= stableford(this.state.hcap, strokes, this.state.holePar, this.state.holeSI)
    history.push('['+this.state.holeNumber+ ']'+strokes+'/'+ pts +' ')
    this.setState({
        holesStrokes:strokes,
        holePts: pts,
        hist: history
    })
    this.handleIncHole(strokes, pts)

}
}
handleDblBogey(event){
    if(this.state.holeNumber<19){
    var strokes=this.state.holePar+2
    if(strokes<1){strokes=1}
    var pts= stableford(this.state.hcap, strokes, this.state.holePar, this.state.holeSI)
    history.push('['+this.state.holeNumber+ ']'+strokes+'/'+ pts +' ')
    this.setState({
        holeStrokes:strokes,
        holePts: pts,
        hist: history
    })
    this.handleIncHole(strokes, pts)
    }
}
handleTrpBogey(event){
   if(this.state.holeNumber<19){
    var strokes =this.state.holePar+3
    if(strokes<1){strokes=1}
    var pts= stableford(this.state.hcap, strokes, this.state.holePar, this.state.holeSI)
    history.push('['+this.state.holeNumber+ ']'+strokes+'/'+ pts +' ')
    this.setState({
        holeStrokes:strokes,
        holePts: pts,
        hist: history
    })
    this.handleIncHole(strokes, pts)

}
}
handleBlob(event){
   if(this.state.holeNumber<19){
    var strokes=9
    var pts= 0
    history.push('['+this.state.holeNumber+ '] -/0 ')
    this.setState({
        holeStrokes:strokes,
        holePts: pts,
        hist: history
    })
    this.handleIncHole(strokes, pts)

}
}
handleCourseSelect(eventkey){
    //console.log(this.state)
    this.setState({'selectedCourseName': eventkey})
    //get hole data
    var dbRefSelectedCourse=dbRefCourses.orderByChild('name').equalTo(eventkey)
    dbRefSelectedCourse.once('value', snap =>{
        snap.forEach((child) =>{
                holes=child.val().holes
                holes.forEach(hole =>{
                    pars[hole.number]=hole.par
                    SIs[hole.number]=hole.SI
                })
            })
        this.forceUpdate()
        })
    }



render() {
    menuItems = ''
    menuItems = this.state.courses.map((course) => (
        <MenuItem eventKey={course}>{course}</MenuItem>))

    var title=  this.state.selectedCourseName +". Player: "+ this.state.playername + '   ('+ this.state.hcap+')'
    return (

        <div>

        <Panel bsStyle="primary" header = {title}>
        <Nav bsStyle="tabs" activeKey="1" onSelect={this.handleCourseSelect.bind(this)}>
                    <NavDropdown eventKey="999" title="Select Course" id="nav-dropdown">
                    {menuItems}
                    </NavDropdown>
                </Nav>
            <pre>Score @:{history.slice(-1).pop()} Running total: {this.state.total} </pre>
        <Well ><h4><i>Score Entry for hole: </i><b> {this.state.holeNumber} </b> <i>Par : </i> {this.state.holePar} <i>SI : </i> {this.state.holeSI}</h4> 
        <Col>
            <Row>			 
                <Button bsStyle='success'  onClick={this.handleEagle.bind(this)}>
                <Glyphicon glyph="flash" />{this.state.holePar-2}
                </Button> 
           
            		 
                <Button bsStyle='success' onClick={this.handleBirdie.bind(this)}>
                <Glyphicon glyph="star" />{this.state.holePar-1}
                </Button> 
       
          		 
                <Button bsStyle='success'  bsSize='large' onClick={this.handlePar.bind(this)}>
                <Glyphicon glyph="ok-sign" />{this.state.holePar}
                </Button> 
           
         
          		 
                <Button bsStyle='warning'  onClick={this.handleBogey.bind(this)}>
                <Glyphicon glyph="thumbs-down" />{this.state.holePar+1}
                </Button> 
         		 
                <Button bsStyle='warning'  onClick={this.handleDblBogey.bind(this)}>
                <Glyphicon glyph="hand-down" /> {this.state.holePar+2}
                </Button> 
    		 
                <Button bsStyle='warning' onClick={this.handleTrpBogey.bind(this)}>
                <Glyphicon glyph="fire" />{this.state.holePar+3}
                </Button> 
            </Row>
            </Col><Clearfix />
            <Row>
            <br />

            <Col xs={6}>			 
                <Button bsStyle='danger' block onClick={this.handleBlob.bind(this)}>
                <Glyphicon glyph="minus-sign" />Blob
                </Button> 
            </Col>
            </Row>
    

            <Row > 
                <hr />
                <Col xs={4} >	
                <Button bsStyle='primary' bsSize='large' onClick={this.handleClearHole.bind(this)}>
                <Glyphicon glyph="arrow-left" />Go back (Clear)
                </Button> 
            </Col>      
            

        </Row>
    

      </Well>
        <Well> 
        <table>
            <thead>
                <th> </th><th>  </th><th>  </th>
            </thead>
            <tbody>
                {playerList}
            </tbody>
        </table>
        </Well>
        </Panel>
        </div>

    )

}
}
