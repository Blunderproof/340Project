import { Component, OnInit } from '@angular/core';
import { GameHistory } from '../services/game-history.service';
import { UserInfo } from '../services/user_info.service';
import { User } from '../classes/user';
import { RouteColor } from '../classes/constants';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  overlayApplied = true;
  trainPathStates = {};
  routeColorEnum = RouteColor;

  constructor(public _gameHistory: GameHistory, public _userInfo: UserInfo) { }

  ngOnInit() {
  }

  mapClicked(event, correspondingTrainPath) {
    const routeInfo = event.path[2].id.split('-');
    const routeColor = this.routeColorEnum[routeInfo[0]];
    const routeNumber = routeInfo[1];
    const routeCity1 = routeInfo[2];
    const routeCity2 = routeInfo[3];

    this.trainPathStates[correspondingTrainPath] = this._userInfo.user.color;
  }

}
