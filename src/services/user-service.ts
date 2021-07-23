import UserModel from "../models/user-model";
import ACrudService from "../interfaces/services/ACrudService";
import ICrudService from "../interfaces/services/ICrudService";
import bcrypt from 'bcrypt';

export class UserService extends ACrudService implements ICrudService {
    public static LOGGER_STRING = 'modules.customer.UserService';


    constructor() {
        super(
            UserModel,
            UserService.LOGGER_STRING,
        );

    }
    protected getMongooseQuerySelectOptions() {
        //do not return the password in standard curd end points
        return "-password";
    }

    protected getMongooseQueryPopulateOptions(methodName: "readOneById" | "readMany") {
        //do not return the password in standard curd end points
        return "roles";
    }

    /**
 * No security check. Supposed to be used only internally for authentication routes!
 * @param userIdOrEmail Can be userId or Email
 */
    public async findUserForAuthByIdOrEmailWithPassword(userIdOrEmail: string): Promise<any> {
        return await UserModel.findOne({ email: userIdOrEmail });

    }

    public async createOne(payload: any): Promise<any> {
        console.debug(`${this.loggerString}:createOne::Start`);


        await this.hashPassword(payload);
        const newModel = new this.model(payload);

        await newModel.save();
        delete newModel._doc.password;
        return newModel;
    }
    private hashPassword = async function (user: any): Promise<void> {
        //if (!user.password) throw user.invalidate('password', 'password is required')
        //if (user.password.length < 12) throw user.invalidate('password', 'password must be at least 12 characters')
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }

    public async findUserById(id: string): Promise<any> {
        return await UserModel.findById(id).select('-password');
    }

}