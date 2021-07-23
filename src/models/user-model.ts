import { emailSchema, isUnique } from "../lib/mongoose.util";
import config from "../lib/config";
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
export const UserSchema = new mongoose.Schema<UserDocument>(
    {
        email: emailSchemaInternal(),
        name: String,
        password: {
            type: String,
            required: true,
            //minlength: 6,
            //maxlength: 20 doesnt make sense. this is the hash value
        },

        resetPasswordNextLogon: Boolean,
        resetPasswordCode: {
            type: String,
            default: '',
        },
        resetPasswordToken: {
            type: String,
            default: '',
        },
        resetPasswordExpires: {
            type: Number,
            default: 0,
        }
    },
    {
        toJSON: { virtuals: true },
        timestamps: true
    }
);

UserSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: (<any>this).email,
            name: (<any>this).name,
            isAdmin: (<any>this).isAdmin,
        }, config.jwtSecret, { expiresIn: '12h' }
    );
};

export interface User {
    userId: string;
    email: string;
    name: string;
    password?: string; //required in schema, but not always populated
    roles: string[];


}


export interface UserDocument extends User, Document {

}

async function isUniqueEmail(doc: any, email: any): Promise<boolean> {
    return await isUnique(UserModel, doc, {
        email: email
    });
}
function emailSchemaInternal(): any {
    return emailSchema({
        required: true,
        isUniqueFn: isUniqueEmail,
        isUnique: true
    });
}
const UserModel = mongoose.model("User", UserSchema);
export default UserModel