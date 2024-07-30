import { Collection, Entity, ManyToMany, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Game } from "../game/game.entity.js";
import { Playlist } from "../playlist/playlist.entity.js";

@Entity()
export class User extends BaseEntity {
  @Property({nullable: false, unique: true})
  nick!: string

  @Property({nullable: false, unique: true})
  email!: string

  @Property({nullable: false})
  password!: string

  @Property({nullable: true})
  profile_img?: string

  @Property({nullable: true})
  bio_text?: string

  @Property({nullable: true})
  linked_accounts?: string[]

  @OneToMany('Playlist', 'owner')
  playlists = new Collection<Playlist>(this)

  // likedGames es una ManyToMany unidireccional; no debería haber una ManyToMany en Game apuntando a User.
  // Nuestro scope no contempla ver a quienes le gustó un juego
  // (no hay función de Amigos como para que sea relevante un "A Fulanito le gustó este juego")
  // TODO: Revisar qué pasa con el Cascade
  @ManyToMany('Game')
  likedGames = new Collection<Game>(this)

  // TODO: Implementar entidad Review
  // @OneToMany(Review)
  // reviews!: Review[]
}