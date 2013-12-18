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

## Demo

A demo is available at [bastien.tanns-lab.fr/munchy](http://bastien.tanns-lab.fr:5555/), give it a try!

**Disclaimer**: it's hosted on a poor little Raspberry Pi so be nice, don't rush him too hard =)  
It uses port 5555, and you need at least two players to start the game. Have fun!

## Current Features

- Pre-Game
	- Login screen with username selection
	- Warmup stage
	- Chatbox
- In-Game
	- Up to four players (for now), with four different character sprites: [red](https://github.com/bastientanesie/munchy/blob/master/public/assets/img/character_red.png), [blue](https://github.com/bastientanesie/munchy/blob/master/public/assets/img/character_blue.png), [green](https://github.com/bastientanesie/munchy/blob/master/public/assets/img/character_green.png) or [yellow](https://github.com/bastientanesie/munchy/blob/master/public/assets/img/character_yellow.png)
	- One [map](https://github.com/bastientanesie/munchy/blob/master/public/assets/img/map.png), but there will surely  be more!
	- Actions in your turn: Move or Pass
	- Moving character with Pathfinding!
	- Realtime players status updates
	- Chatbox

## How it works

#### Sign in

First, you need to login : **no signup required**, just enter a nickname and you're good to go.  
The server will then assign you **a brand new character**, randomly picked between the four available character.

#### Warmup

Once all players are "ready", the server will launch the **warmup stage** (10 seconds), then the game will officially start.

The playing order is based on the order of arrival of the players on the server : first to come = first to play. I plan to build a random order, so it'll be more fair.

#### Your turn

When it's your turn, you got two options : **move** your character or **pass** to the next player.

Your character has 3 **"Ability Points"** (AP). They are used for every actions you make with your character.  
For example, moving will spend 1 AP for 1 block. Once you've run out of AP, you can no longer do actions.

To move your character, select "Move" and the **move grid will** appear.  
Click on the map where you want your character to move and the **pathfinding** will do his magic : the path to this location will be processeed on the server-side and then be displayed on the map (marked with red semi-transparent tiles).  
Click again on one of the marked tiles and your character will move to this tile, with a **cool moving animation** synced to all other players.

## How to play

Munchy requires Node 0.8.x or newer. To install all dependancies and then start the server, please run these commands in your terminal (where you've installed the sources) :

	> npm install
	> node server.js

## Tech Specs

### Client Side

The client side is powered by HTML5 canvas with [CreateJS](http://www.createjs.com/).  
[Bootstrap 2](http://getbootstrap.com/2.3.2/) (with [LESS](http://lesscss.org/)) is used for prototyping a simple UI for the purpose of this demo.

### Server Side

The main durty work is made with [Node](http://nodejs.org/) and [Socket.io](http://socket.io/) for realtime features.

### Required Node modules

- [Express](http://expressjs.com/) + [EJS](http://embeddedjs.com/)
- [LESS](http://lesscss.org/)
- [Socket.io](http://socket.io/)
- [Pathfinding.js](https://github.com/qiao/PathFinding.js) by Xueqiao Xu