import { Cascade, Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { User } from "../user/user.entity.js";

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

    // TODO: Relacion n..m con Game. Ver Rel<entidadX> en vid 68
}