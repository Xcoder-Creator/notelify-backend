import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/database";

export class UserAccount extends Model<
    InferAttributes<UserAccount>,
    InferCreationAttributes<UserAccount>
> {
    /** The user ID */
    declare id: CreationOptional<number>;
    
    /** The name of the user */
    declare username: string;

    /** The email of the user */
    declare email: string;
    
    /** The password hash */
    declare password_hash: string;

    /** The account creation date */
    declare created_at: CreationOptional<Date>;

    /** Whether the user is verified */
    declare is_verified: CreationOptional<boolean>;

    /** How many times the user has attempted to log in */
    declare login_attempts: CreationOptional<number>;

    /** When the user account is locked until */
    declare lock_until: CreationOptional<Date | null>;

    /** When the user last failed to log in */
    declare last_failed_login: CreationOptional<Date | null>;
}

UserAccount.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    password_hash: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    login_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    lock_until: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    last_failed_login: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    tableName: "user_accounts",
    timestamps: false,
});