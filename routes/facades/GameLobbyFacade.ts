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
          playerList: [reqUserID],
        });

        // Save the new model instance, passing a callback

        return await newGame.save().then(game => {
          return {
            success: true,
            data: {
              gameID: game._id,
            },
            emitCommand: "gameList",
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
            emitCommand: "gameList",
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

    // query DB for game with the user in its player list already. Await it, only respond if nothing
    const results: any = await Game.findOne({
      playerList: reqUserID,
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
        if (game.playerList.length >= 5) {
          return {
            success: false,
            data: {},
            errorInfo: "The specified game already has 5 players.",
          };
        } else {
          game.playerList.push(reqUserID);
          return await game.save().then(game => {
            return {
              success: true,
              data: { message: "Game joined." },
              emitCommand: "gameList",
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
      playerList: reqUserID,
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
        const index = game.playerList.indexOf(reqUserID);
        game.playerList.splice(index, 1);

        return await game.save().then(game => {
          return {
            success: true,
            data: { message: "Game left." },
            emitCommand: "gameList",
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
    return new Promise((resolve: any, reject: any) => {
      resolve({
        success: false,
        data: {},
        errorInfo: "GameLobbyFacade startGame: not implemented.",
      });
    });
  }
}
