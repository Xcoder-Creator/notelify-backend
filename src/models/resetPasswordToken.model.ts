import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/database";

/**
 * This is the reset password tokens table where the
 * reset password tokens are generated and stored for every new
 * password reset request.
 */
export class ResetPasswordToken extends Model<
    InferAttributes<ResetPasswordToken>,
    InferCreationAttributes<ResetPasswordToken>
> {
    /** The ID of each reset password token */
    declare id: CreationOptional<number>;

    /** The ID of the user */
    declare user_id: number;

    /** The user's reset password token */
    declare reset_password_token: string;

    /** The date at which the token expires */
    declare expires_at: Date;
}

ResetPasswordToken.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reset_password_token: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    tableName: "reset_password_tokens",
    timestamps: false
});