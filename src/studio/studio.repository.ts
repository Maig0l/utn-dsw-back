import { Repository } from "../shared/repository.js";
import { Studio } from "./studio.entity.js";

const studios: Studio[] = [];
studios.push(new Studio("ATLUS",["Desarrollador"],"https://atlus.com/"))
studios.push(new Studio("WSS Playground",["Desarrollador", "Editor"],"https://whysoserious.jp/en/"))
studios.push(new Studio("Square Enix",["Desarrollador", "Editor"],"https://www.square-enix-games.com/es_XL/home"))

export class StudioRepository implements Repository<Studio, number> {
    public findAll(): Studio[] | undefined {
        return studios;
    }

    public findOne(item: {id: number}): Studio | undefined {
        return studios.find(studio => studio.id === item.id);
    }

    public add(item: Studio): Studio | undefined{
        if(!reqHasParams(item, ["name", "type", "site"])) 
        return undefined;
    
        const x = new Studio(item.name, item.type, item.site)
        studios.push(x);
        return x;
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
            return undefined;

        const studio = studios.splice(idxStudio, 1)[0];
        return studio;
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