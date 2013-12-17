Munchy
======

Munchy is a **prototype** of turn-based realtime multiplayer Web game, based on HTML5 canvas and NodeJS.

For me, it's a workspace to try brand new stuff :

- Object Oriented Javascript
- A "real" project with Node and especially Socket.io
- Managing a multiplayer environment
- Building a video game
- Creating turn-based game logic
- Getting durty with HTML5 canvas and CreateJS

## Current Features

- Pre-Game
	- Login screen with username selection
	- Warmup stage
	- Chatbox
- In-Game
	- Actions in your turn: Move or Pass
	- Moving character + Pathfinding (moving is currently not synchronised)
	- Realtime players status updates
	- Chatbox

## How to play

Munchy requires Node >= 0.8.x.   To install all dependancies, please : run

	npm install

## Tech Specs

### Client Side

The client side is powered by HTML5 canvas with [CreateJS](http://www.createjs.com/).

[Bootstrap 2](http://getbootstrap.com/2.3.2/) (with [LESS](http://lesscss.org/)) is used for prototyping a simple UI for the purpose of this demo.

### Server Side

The main durty work is made with by [Node](http://nodejs.org/) and [Socket.io](http://socket.io/) for realtime features.

### Required Node modules

- [Express](http://expressjs.com/) + [EJS](http://embeddedjs.com/)
- [LESS](http://lesscss.org/)
- [Socket.io](http://socket.io/)
- [Pathfinding.js](https://github.com/qiao/PathFinding.js) by Xueqiao Xu