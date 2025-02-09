import { Cascade, Entity, ManyToOne, Property, Collection, ManyToMany } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { User } from '../user/user.entity.js';
import { Game } from '../game/game.entity.js';

@Entity()
export class Playlist extends BaseEntity {
  @Property({ nullable: false, unique: true })
  name!: string;

  @Property()
  description!: string;

  @Property()
  isPrivate!: boolean;

  @ManyToOne('User', {
    cascade: [Cascade.ALL],
  })
  owner!: User;

  @ManyToMany(() => Game)
  games = new Collection<Game>(this);
}
