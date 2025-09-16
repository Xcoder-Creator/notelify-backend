import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/database";

/**
 * This is the attachments table that contains all the
 * attachments that are linked to available user notes.
 */
export class Attachments extends Model<
    InferAttributes<Attachments>,
    InferCreationAttributes<Attachments>
> {
    /** The ID of each attachment */
    declare id: CreationOptional<number>;

    /** The ID of the user that created the attachment */
    declare user_id: number;

    /** The ID of the note that the attachment is linked to */
    declare note_id: string;

    /** The url of the file attachment */
    declare file_url: string;

    /** The type of file attachment */
    declare file_type: string;

    /** The public ID of the attachment from cloudinary */
    declare public_id: string;
}

Attachments.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    note_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    file_url: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    file_type: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    public_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    tableName: "attachments",
    underscored: true,
    timestamps: true
});