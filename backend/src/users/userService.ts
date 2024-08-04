import { User } from "../types/userType";
import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

//var low = require("lowdb");
//var FileSync = require("lowdb/adapters/FileSync");

const USERS_DB_FILE = '../database/users.json';

type Data = {
    users: User[]
}
const defaultData: Data = {users: []};

export class UserService {
    
    private db: lowdb.LowdbSync<lowdb.AdapterAsync>;
    
    constructor() {
        const file = new FileSync(USERS_DB_FILE);
        this.db = lowdb(file);
        this.initDatabase();
    }
    
    private initDatabase(): void {
        this.db.defaults(defaultData).write();
    }

    public findUserById(userId: string): User | undefined {
        const allUsers: User[] = this.db.get('users');
        const users = allUsers.filter(u => userId === u.userId);
        
        if (users.length === 1) {
            return users[0];
        }
        return undefined;
    }

}