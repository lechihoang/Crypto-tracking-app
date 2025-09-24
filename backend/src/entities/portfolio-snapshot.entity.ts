import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("portfolio_snapshots")
@Index(["userId"])
@Index(["snapshotDate"])
export class PortfolioSnapshot {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id", type: "uuid" })
  userId: string;

  @Column({ name: "total_value", type: "decimal", precision: 20, scale: 8 })
  totalValue: number;

  @CreateDateColumn({ name: "snapshot_date" })
  snapshotDate: Date;
}
