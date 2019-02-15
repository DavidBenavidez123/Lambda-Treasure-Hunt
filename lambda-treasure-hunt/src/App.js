import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import config from './secret';

axios.defaults.headers.common['Authorization'] = config.token;
axios.defaults.headers.post['Content-Type'] = 'application/json';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room_id: 0,
      title: '',
      coordinates: '',
      exits: [],
      cooldown: 0, //1000 setInterval
      errors: '',
      description: '',
      elevation: 0,
      items: [],
      messages: [],
      players: [],
      terrain: '',
      graph: {}
    };
  }

  getCoordinates = (coordinates) => {
    const x = coordinates.replace(/[%^()]/g, '').split(',')[0];
    const y = coordinates.replace(/[%^()]/g, '').split(',')[1];
    const coordsObject = { x, y };
    return coordsObject;
  };

  inverseDirection = (direction) => {
    const inverseDir = { n: 's', s: 'n', w: 'e', e: 'w' };
    return inverseDir[direction];
  };

  updateGraph = (id, coordinates, exits, prevRoomId = null, direction = null) => {
    let graph = Object.assign({}, this.state.graph);
    if (!this.state.graph[`Room ${this.state.room_id}`]) {
      const directions = {};
      for (let exit of this.state.exits) {
        console.log(exit);
        directions[exit] = '?';
      }
      // room 1: {coords: {x: x, y:y} {exits: {n: ?, s: ?, e: ?, w: ?}}}
      let graphObj = { coords: coordinates, exits: directions };
      graph[`Room ${this.state.room_id}`] = graphObj;
    }
    if (prevRoomId && direction) {
      console.log(graph[`Room ${prevRoomId}`]['exits'][direction]);
      const inverse = this.inverseDirection(direction);
      graph[`Room ${prevRoomId}`]['exits'][direction] = this.state.room_id;
      graph[`Room ${this.state.room_id}`]['exits'][inverse] = prevRoomId;
    }
    return graph;
  };
  
  componentDidMount() {
    if (localStorage.hasOwnProperty('graph')) {
      const graph = JSON.parse(localStorage.getItem('graph'));
      this.setState({ graph });
    }
    const prev_room_id = this.state.room_id;
    axios
      .get('https://lambda-treasure-hunt.herokuapp.com/api/adv/init/')
      .then((response) => {
        console.log(response.data);
        // functional set State returns the function immediately
        this.setState(function() {
          return {
            room_id: response.data.room_id,
            cooldown: response.data.cooldown,
            title: response.data.title,
            elevation: response.data.elevation,
            coordinates: response.data.coordinates,
            exits: response.data.exits
          };
        });
        const graph = this.updateGraph(
          this.state.room_id,
          this.getCoordinates(this.state.coordinates),
          this.state.exits,
          prev_room_id
        );
        this.setState({ graph });
      })
      .catch((error) => {
        console.log(error);
      });
    setTimeout(() => {
      this.handleMovement();
      console.log(this.state.exits);
    }, 500);
  }

  handleMovement(direction) {
    const data = {
      direction: direction
    };
    const prev_room_id = this.state.room_id;
    axios
      .post('https://lambda-treasure-hunt.herokuapp.com/api/adv/move/', data)
      .then((response) => {
        console.log(response.data);
        this.setState(function() {
          return {
            room_id: response.data.room_id,
            cooldown: response.data.cooldown,
            title: response.data.title,
            elevation: response.data.elevation,
            coordinates: response.data.coordinates,
            exits: response.data.exits
          };
        });
        const graph = Object.assign(
          {},
          graph,
          this.updateGraph(
            this.state.room_id,
            this.getCoordinates(this.state.coordinates),
            this.state.exits,
            prev_room_id,
            direction
          )
        );
        localStorage.setItem('graph', JSON.stringify(graph));
      })
      .catch((error) => console.error(error));
  }

  render() {
    return (
      <div className="App">
        <div> Title: {this.state.title} </div>
        <div> Room Id: {this.state.room_id}</div>
        <div> Cooldown: {this.state.cooldown}</div>
        <div> Coordinates: {this.state.coordinates}</div>
        <div> Elevation: {this.state.elevation}</div>
        <div> Exits: {this.state.exits} </div>
        <button onClick={() => this.handleMovement('n')}> N </button>
        <button onClick={() => this.handleMovement('s')}> S </button>
        <button onClick={() => this.handleMovement('e')}> E </button>
        <button onClick={() => this.handleMovement('w')}> W </button>
      </div>
    );
  }
}

export default App;