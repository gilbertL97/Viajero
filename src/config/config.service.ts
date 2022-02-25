import console from 'console';
import * as fs from 'fs';
import { parse } from 'dotenv';

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    const isDevEnv = process.env.NODE_ENV !== 'production';
    if(isDevEnv){
        const envFilePath=__dirname +'/../../.env';
        const existPath = fs.existsSync(envFilePath);
     
        if (!existPath){
            console.log('.env file does not exist')
            process.exit(0);
        }
        this.envConfig=parse(fs.readFileSync(envFilePath))
    }
     else{
        this.envConfig={
            POSTGRES_HOST=process.env.POSTGRES_HOST;
        }
    }
    
    } 
    get(key:string):string{
        return this.envConfig[key];
    } 
}

