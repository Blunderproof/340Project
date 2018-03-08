import { Route } from './route';
import { TrainCard } from './train-card';
import { DestinationCard } from './destination-card';
import { PlayerColor } from './constants';

export class User {
    _id: string;
    username: string;
    claimedRouteList: Route[];
    trainCardHand: TrainCard[];
    destinationCardHand: DestinationCard[];
    score: number;
    color: PlayerColor;

    constructor(data?: Object) {
        Object.keys(data || {}).forEach(key => this[key] = data[key]);

        this.claimedRouteList = (this.claimedRouteList || []).map(x => new Route(x));
        this.trainCardHand = (this.trainCardHand || []).map(x => new TrainCard(x));
        this.destinationCardHand = (this.destinationCardHand || []).map(x => new DestinationCard(x));
    }
}