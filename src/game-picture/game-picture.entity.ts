import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Game } from "../game/game.entity.js";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";

@Entity()
export class GamePicture extends BaseEntity {
  @Property({ nullable: false, unique: false })
  url!: string;

  @ManyToOne()
  game!: Game;
}
