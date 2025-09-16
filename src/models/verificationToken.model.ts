import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/database";

/**
 * This is the verification tokens table where the
 * verification tokens are generated and stored for every new
 * user account.
 */
export class VerificationToken extends Model<
    InferAttributes<VerificationToken>,
    InferCreationAttributes<VerificationToken>
> {
    /** The ID of each verification token */
    declare id: CreationOptional<number>;

    /** The ID of the user */
    declare user_id: number;

    /** The user's verification token */
    declare verification_token: string;

    /** The date at which the token expires */
    declare expires_at: Date;
}

VerificationToken.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    verification_token: {
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
    tableName: "verification_tokens",
    timestamps: false
});