import { Component, OnInit, Input } from '@angular/core';
import { User } from '../classes/user';
import { UserInfo } from '../services/user_info.service';
import { RGBAColor } from '../classes/constants';


@Component({
  selector: 'app-opponent-card',
  templateUrl: './opponent-card.component.html',
  styleUrls: ['./opponent-card.component.scss']
})
export class OpponentCardComponent implements OnInit {
  @Input() index: number;
  colorEnum = RGBAColor;

  constructor(public _userInfo: UserInfo) { }

  ngOnInit() {}

  destCardClicked() {
    if (this._userInfo.game.userList[this.index]._id == this._userInfo.user._id) {
      this._userInfo.viewDestinationCards = !this._userInfo.viewDestinationCards;
    }
  }

}
