import * as mongoose from 'mongoose';
import { User, IUserModel } from './User';
import { Schema } from 'mongoose';
import { TrainColor } from '../constants';

export interface IRouteModel extends mongoose.Document {
  color: TrainColor;
  length: number;
  routeNumber: number;
  city1: string;
  city2: string;
}

export var RouteSchema: Schema = new Schema({
  color: String,
  length: Number,
  routeNumber: Number,
  city1: String,
  city2: String,
});

RouteSchema.methods.pointValue = function() {
  switch (this.length) {
    case 1:
      return 1;

    case 2:
      return 2;

    case 3:
      return 4;

    case 4:
      return 7;

    case 5:
      return 10;

    case 6:
      return 15;

    default:
      break;
  }
  return 0;
};

export const Route: mongoose.Model<IRouteModel> = mongoose.model<IRouteModel>(
  'Route',
  RouteSchema
);