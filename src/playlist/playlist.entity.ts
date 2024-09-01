import { Cascade, Entity, ManyToOne, Property, Collection, ManyToMany } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { User } from "../user/user.entity.js";
import { Game } from "../game/game.entity.js";

@Entity()
export class Playlist extends BaseEntity {
    @Property({nullable: false, unique: true})
    name!: string
    
    @Property()
    description!: string

    @Property()
    is_private!: boolean
    // "is_private" un buen nombre? CONSULTA

    @ManyToOne('User', {
        cascade: [Cascade.ALL]
    })
    owner!: User

    // CONSULTA: Hay muchas playlists. Una playlist conoce qué juegos tiene. Los juegos no necesitan saber en qué playlists están
    // Se usa esto?
    @ManyToMany(() => Game)
    games = new Collection<Game>(this);
}