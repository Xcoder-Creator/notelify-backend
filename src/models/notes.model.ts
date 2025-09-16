import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/database";

/**
 * This is the notes table that contains all the
 * users notes.
 */
export class Notes extends Model<
    InferAttributes<Notes>,
    InferCreationAttributes<Notes>
> {
    /** The ID of each note */
    declare note_id: CreationOptional<string>;

    /** The ID of the user that created the note */
    declare user_id: number;

    /** The title of the note */
    declare title: string | null;

    /** The content of the note */
    declare content: string | null; 

    /** Whether the note is a draft or not */
    declare is_draft: boolean;

    /** Whether the note is pinned or not */
    declare pinned: boolean;

    /** The background color theme of the note */
    declare bg_color: number;

    /** The background wallpaper of the note */
    declare wallpaper: number;
}

Notes.init({
    note_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,  // auto-generate random UUIDs
        allowNull: false,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_draft: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    bg_color: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    wallpaper: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    tableName: "notes",
    underscored: true,
    timestamps: true
});