import { PassportStrategy } from "@nestjs/passport";
import {ExtractJwt, Strategy } from "passport-jwt";
import * as dot from 'dotenv';
dot.config();
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor() {
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKey: 'process.env.SECRET_KEY',
        });
        console.log(process.env.SECRET_KEY);
      }
    async validate(payload: any) {       
        return { userId: payload.id, username: payload.username,role:payload.role };
      }
}
