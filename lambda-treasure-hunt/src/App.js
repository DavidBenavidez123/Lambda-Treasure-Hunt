import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

class App extends Component {
  state = {
    room: {
      room_id: 0,
      title: '',
      description: '',
      coordinates: '',
      elevation: 0,
      terrain: '',
      players: [],
      items: [],
      exits: [],
      cooldown: 0,
      errors: [],
      messages: []
    }
  };

  componentDidMount() {
    const header = {
      headers: {
        Authorization: 'Token 6d79e6cf13334040cf7a456c936213c49270f711'
      }
    };
    axios
      .get('https://lambda-treasure-hunt.herokuapp.com/api/adv/init/', header)
      .then(response => {
        console.log(response.data);
        console.log(response.data.cooldown);
        this.setState({
          room: response.data
        });
      })
      .catch(err => console.log(err));
  }

  handleMovement = (e) => {
    const header = {
      headers: {
        Authorization: 'Token 6d79e6cf13334040cf7a456c936213c49270f711',
      }
    };
    const data = {
      direction: e
    }
    axios
      .post('https://lambda-treasure-hunt.herokuapp.com/api/adv/move/', data, header)
      .then(res => console.log(res.data))
      .catch(err => console.error(err.res.data));
  };
  render() {
    return (
      <div className="App">
        <ul>
          <li>title: {this.state.room.title}</li>
          <li>Coordinates: {this.state.room.coordinates}</li>
          <li>Exits: {this.state.room.exits}</li>
          <li>Cooldown: {this.state.room.cooldown}</li>
          <li>Room ID: {this.state.room.room_id}</li>
          <li>Players: {this.state.room.players}</li>
          <li>Errors: {this.state.room.errors}</li>
          <li>Messages: {this.state.room.messages}</li>
          <li>description: {this.state.room.description}</li>
        </ul>
        <button onClick = {() => this.handleMovement('n')}>North</button>
        <button onClick = {() => this.handleMovement('s')}>South</button>
        <button onClick = {() => this.handleMovement('e')}>East</button>
        <button onClick = {() => this.handleMovement('w')}>West</button>

      </div>
    );
  }
}

export default App;
