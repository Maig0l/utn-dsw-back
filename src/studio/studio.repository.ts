import { Repository } from "../shared/repository.js";
import { Studio } from "./studio.entity.js";

const studios: Studio[] = [];

export class StudioRepository implements Repository<Studio> {
    public findAll(): Studio[] | undefined {
        return studios;
    }

    public findOne(item: {id: number}): Studio | undefined {
        return studios.find(studio => studio.id === item.id);
    }

    public add(item: Studio): Studio | undefined{
        if(!reqHasParams(item, ["name", "type", "site"])) 
        return undefined;
    }

    public update(item: Studio): Studio | undefined {
        const idxStudio = studios.findIndex(studio => studio.id === item.id)
        if (idxStudio === -1)
            return
        studios[idxStudio] = {...studios[idxStudio], ...item, id: studios[idxStudio].id};
        return studios[idxStudio];
    }

    public remove(item: {id: number; }): Studio | undefined{
        const idxStudio = studios.findIndex(studio => studio.id === item.id);
        if (idxStudio === -1)
            return

        const studio = studios.splice(idxStudio, 1)[0];
        return studio
    }
}


function reqHasParams(item: Studio, params: string[]): Boolean {
    return params.every( (e) => {
      return Object.keys(item).includes(e)
    })
  }
  
  function reqHasSomeParams(item: Studio, params: string[]): Boolean {
    return params.some( (e) => {
      return Object.keys(item).includes(e)
    })
  }