import {
    Entity,
    Property,
    ManyToMany,
    Cascade,
    Collection,
    ManyToOne,
    Rel
  } from '@mikro-orm/core'
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Studio } from '../studio/studio.entity.js';
import { Shop } from '../shop/shop.entity.js';
import { Platform } from '../platform/platform.entity.js';
import { Franchise } from '../franchise/franchise.entity.js';
import { User } from '../user/user.entity.js';
import { Tag} from '../tag/tag.entity.js';

@Entity()
export class Game extends BaseEntity {
    @Property({nullable: false, unique: true})
    title!: string
    
    @Property()
    synopsis!: string

    @Property({nullable: false})
    releaseDate!: Date //debe usarse en formato date?

    @Property()
    portrait!: string

    @Property()
    banner!: string

    @Property()
    pictures!: string[]

    @ManyToMany(() => Tag, (tag) => tag.games, {
        cascade: [Cascade.ALL],
        owner: true,
    })
    tag!: Tag[]

   @ManyToMany(() => Studio, (studio) => studio.games, {
        cascade: [Cascade.ALL],
        owner: true,
    }) //Relacion muchos a muchos con la entidad Studio?
    studio!: Studio[]

    @ManyToMany(() => Shop, (shop) => shop.games, {
        cascade: [Cascade.ALL],
        owner: true,
    })
    shop!: Shop[]
    
    @ManyToOne(() => Franchise, { nullable: false })
    franchise!: Rel<Franchise>

   @ManyToMany(() => Platform, (platform) => platform.games, {
        cascade: [Cascade.ALL],
        owner: true,
    })
    platform!: Platform[]
}
    //Proximamente propiedades de relaciones con otras entidades (menos User; ver comentario en User.entity.ts)