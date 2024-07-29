import { Entity, Property, ManyToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Game } from "../game/game.entity.js";

@Entity()
export class Platform extends BaseEntity {
    @Property({nullable: false, unique: true})
    name!: string
    
    @Property()
    img!: string

    @ManyToMany(() => Game, (game) => game.platform)
    games = new Collection<Game>(this)
    //Deberia estar bien
}