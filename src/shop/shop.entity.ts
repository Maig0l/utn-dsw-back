import { Entity, PrimaryKey, Property, ManyToMany, Cascade, Collection, OneToMany } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Game } from "../game/game.entity.js";
import { Release} from '../release/release.entity.js';

@Entity()
export class Shop extends BaseEntity {
  @Property({nullable: false, unique: true})
  name!: string
  // Mientras que img y site pueden ser vacíos, no serán undefined, si no ""
  // O sea, son nullables en la DB, pero en TS serán String 
  @Property()
  img!: string

  @Property({unique: true})
  site!: string

  @ManyToMany(() => Game, (game) => game.shops)
  games = new Collection<Game>(this)

  @OneToMany('Release', 'shop')
  releases = new Collection<Release>(this)
}
