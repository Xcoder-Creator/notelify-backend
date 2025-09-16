import { UserAccount } from "./userAccount.model";
import { ResetPasswordToken } from "./resetPasswordToken.model";
import { RefreshToken } from "./refreshToken.model";
import { VerificationToken } from "./verificationToken.model";
import { Attachments } from "./attachments.model";
import { Notes } from "./notes.model";

// Define associations here
Notes.hasMany(Attachments, { foreignKey: "note_id", as: "attachments" });
Attachments.belongsTo(Notes, { foreignKey: "note_id", as: "note" });

export { 
    UserAccount, 
    ResetPasswordToken, 
    RefreshToken, 
    VerificationToken, 
    Notes, 
    Attachments 
};