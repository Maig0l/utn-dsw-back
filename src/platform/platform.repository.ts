import { Repository } from "../shared/repository.js";
import { Platform } from "./platform.entity.js";


const platforms: Platform[] = [];
platforms.push(new Platform("Play Station 1", "/assets/ps1.svg"))
platforms.push(new Platform("Play Station 2", "/assets/ps2.svg"))

export class PlatformRepository implements Repository<Platform> {
  
  public findAll(): Platform[] | undefined {
    return platforms
  }

  public findOne(item: { id: number; }): Platform | undefined {
    return platforms.find((platform)=> {return platform.id === item.id})
  }

  public add(item: Platform): Platform | undefined {
    platforms.push(item)  
    return item
  }

  public update(item: Platform): Platform | undefined {
    const platformIdx = platforms.findIndex((platform) => String(platform.id) === String(item.id)) //me dio problemas, asi anda
    if(platformIdx!==-1){
      platforms[platformIdx] = {...platforms[platformIdx], ...item}
    }
    return platforms[platformIdx]
  }

  public remove(item: { id: number; }): Platform | undefined { 
    const platformIdx = platforms.findIndex((platform) => platform.id === item.id)
    if(platformIdx!==-1){
      const deletedPlatforms = platforms.splice(platformIdx,1)[0]
      return deletedPlatforms
    }
  }
}