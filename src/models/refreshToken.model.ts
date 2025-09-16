import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/database";

export class RefreshToken extends Model<
    InferAttributes<RefreshToken>,
    InferCreationAttributes<RefreshToken>
> {
    /** The ID of each refresh token */
    declare id: CreationOptional<number>;

    /** The ID of the user */
    declare user_id: number;

    /** The user's refresh token */
    declare refresh_token: string;
}

RefreshToken.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    refresh_token: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    sequelize,
    tableName: "refresh_tokens",
    timestamps: true,
});