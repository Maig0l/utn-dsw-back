import { Repository } from "../shared/repository.js";
import { Game } from "./game.entity.js";

const games: Game[] = [];

export class GameRepository implements Repository<Game> {
    public findAll(): Game[] | undefined {
        return games;
    }

    public findOne(item: {id: number}): Game | undefined {
        return games.find(game => game.id === item.id);
    }

    public add(item: Game): Game | undefined{
        if(!reqHasParams(item, ["title", "synopsis", "releaseDate", "portrait", "banner", "pictures"])) 
        return undefined;
    }

    public update(item: Game): Game | undefined {
        const idxGame = games.findIndex(game => game.id === item.id)
        if (idxGame === -1)
            return
        games[idxGame] = {...games[idxGame], ...item, id: games[idxGame].id};
        return games[idxGame];
    }

    public remove(item: {id: number; }): Game | undefined{
        const idxGame = games.findIndex(game => game.id === item.id);
        if (idxGame === -1)
            return

        const game = games.splice(idxGame, 1)[0];
        return game
    }
}

function reqHasParams(item: Game, params: string[]): Boolean {
    return params.every( (e) => {
      return Object.keys(item).includes(e)
    })
  }

    function reqHasSomeParams(item: Game, params: string[]): Boolean {
        return params.some( (e) => {
        return Object.keys(item).includes(e)
        })
    }