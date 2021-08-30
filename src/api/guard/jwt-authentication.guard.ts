import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class jwtAuthenticationGuard extends AuthGuard('jwt') {}
