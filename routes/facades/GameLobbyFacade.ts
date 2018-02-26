import { Game, GameState } from "../../models/Game";
import CommandResults from "../../modules/commands/CommandResults";

export default class GameLobbyFacade {
  // TODOs
  // validate all pre and post conditions

  private constructor() {}

  private static instance = new GameLobbyFacade();
  static instanceOf() {
    if (!this.instance) {
      this.instance = new GameLobbyFacade();
    }
    return this.instance;
  }

  validateUserAuth(data: any) {
    console.log(data);
    if (!data.reqUserID) {
      const promise = new Promise((resolve: any, reject: any) => {
        resolve({
          success: false,
          data: {},
          errorInfo: "User is must be logged in to execute this command.",
        });
      });
      return promise;
    } else {
      return null;
    }
  }

  createGame(data: any): Promise<any> {
    let loginCheck: any = null;
    if ((loginCheck = this.validateUserAuth(data)) != null) {
      return loginCheck;
    }

    // TODO cannot create game if user is already in game
    const { reqUserID } = data;
    return Game.findOne({
      $or: [
        {
          host: reqUserID,
          gameState: GameState.Open,
        },
        {
          host: reqUserID,
          gameState: GameState.InProgress,
        },
      ],
    }).then(async game => {
      if (game) {
        // doc may be null if no document matched
        return {
          success: false,
          data: {},
          errorInfo: "User already has an open game or a game in progress.",
        };
      } else {
        var newGame = new Game({
          host: reqUserID,
          gameState: GameState.Open,
          userList: [reqUserID],
        });

        // Save the new model instance, passing a callback

        return await newGame.save().then(game => {
          return {
            success: true,
            data: {
              gameID: game._id,
            },
            emit: [{command:"gameList"}],
          };
        });
      }
    });
  }

  deleteGame(data: any): Promise<any> {
    let loginCheck: any = null;
    if ((loginCheck = this.validateUserAuth(data)) != null) {
      return loginCheck;
    }

    const { reqUserID } = data;

    return Game.findOne({
      host: reqUserID,
      gameState: GameState.Open,
    }).then(async game => {
      if (game) {
        // doc may be null if no document matched
        return await game.remove().then(() => {
          return {
            success: true,
            data: {
              message: "Game deleted.",
            },
            emit: [{command:"gameList"}],
          };
        });
      } else {
        // Save the new model instance, passing a callback
        return {
          success: false,
          data: {},
          errorInfo: "User does not have an open game.",
        };
      }
    });
  }

  async joinGame(data: any): Promise<any> {
    let loginCheck: any = null;
    if ((loginCheck = this.validateUserAuth(data)) != null) {
      return loginCheck;
    }

    if (!data.gameID) {
      const promise = new Promise((resolve: any, reject: any) => {
        resolve({
          success: false,
          data: {},
          errorInfo: "Request is missing parameters 'gameID'.",
        });
      });
      return promise;
    }

    const { gameID, reqUserID } = data;

    // query DB for game with the user in its user list already. Await it, only respond if nothing
    const results: any = await Game.findOne({
      userList: reqUserID,
    }).then(game => {
      if (game) {
        // doc may be null if no document matched
        if (game._id == gameID) {
          return {
            success: false,
            data: {},
            errorInfo: "You have already joined this game!",
          };
        } else {
          return {
            success: false,
            data: {},
            errorInfo:
              "You can't join this game because you are already in a game!",
          };
        }
      } else {
        // Save the new model instance, passing a callback
        return null;
      }
    });

    if (results != null) {
      return results;
    }

    return Game.findOne({
      _id: gameID,
    }).then(async game => {
      if (game) {
        // doc may be null if no document matched
        if (game.userList.length >= 5) {
          return {
            success: false,
            data: {},
            errorInfo: "The specified game already has 5 users.",
          };
        } else {
          game.userList.push(reqUserID);
          return await game.save().then(game => {
            return {
              success: true,
              data: { message: "Game joined." },
              emit: [{command:"gameList"}],
            };
          });
        }
      } else {
        // Save the new model instance, passing a callback
        return {
          success: false,
          data: {},
          errorInfo: "The specified game does not exist!",
        };
      }
    });
  }

  leaveGame(data: any): Promise<any> {
    let loginCheck: any = null;
    if ((loginCheck = this.validateUserAuth(data)) != null) {
      return loginCheck;
    }

    const { reqUserID } = data;
    return Game.findOne({
      userList: reqUserID,
    }).then(async game => {
      if (game) {
        // doc may be null if no document matched
        if (game.host == reqUserID) {
          return {
            success: false,
            data: {},
            errorInfo: "You can't leave your own game!",
          };
        }
        const index = game.userList.indexOf(reqUserID);
        game.userList.splice(index, 1);

        return await game.save().then(game => {
          return {
            success: true,
            data: { message: "Game left." },
            emit: [{command:"gameList"}],
          };
        });
      } else {
        // Save the new model instance, passing a callback
        return {
          success: false,
          data: {},
          errorInfo: "You are not in a game to leave!",
        };
      }
    });
  }

  startGame(data: any): Promise<any> {
    let loginCheck: any = null;
    if ((loginCheck = this.validateUserAuth(data)) != null) {
      return loginCheck;
    }

    const { reqUserID } = data;

    return Game.findOne({
      host: reqUserID,
      gameState: GameState.Open,
    }).then(async game => {
      if (game) {
        // doc may be null if no document matched
        if (game.userList.length <= 1 || game.userList.length > 5) {
          return {
            success: false,
            data: {},
            errorInfo: "Your game doesn't have enough users to start!",
          };
        } else {
          game.gameState = GameState.InProgress;
          return await game.save().then(data => {
            return {
              success: true,
              data: { message: "Game started!" },
              emit: [{command:"gameList"},{command:"startGame",to:game._id}],
            };
          });
        }
      } else {
        // Save the new model instance, passing a callback
        return {
          success: false,
          data: {},
          errorInfo: "User does not have an open game!",
        };
      }
    });
  }

  getOpenGameList(data: any): Promise<any> {
    let loginCheck: any = null;
    if ((loginCheck = this.validateUserAuth(data)) != null) {
      return loginCheck;
    }

    return new Promise((resolve: any, reject: any) => {
      resolve({
        success: true,
        data: {},
        emit: [{command:"gameList"}],
      });
    });
  }
}
