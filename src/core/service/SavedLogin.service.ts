import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SavedLogin } from '../../infrastructure/entities/Savedlogin.entity';
import { Repository } from 'typeorm';
import { Key } from '../../infrastructure/entities/key';
import {
  AuthenticationInterface,
  authenticationInterfaceProvider,
} from '../interfaces/authentication.interface';
import { InsertSavedLoginDto } from '../../ui.api/dto/savedLogin/insert-SavedLogin.dto';
import { KeyModel } from '../models/key.model';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { SavedLoginModel } from "../models/Savedlogin.model";

@Injectable()
export class SavedLoginService {
  constructor(
    @InjectRepository(SavedLogin)
    private loginRepository: Repository<SavedLogin>,
    @InjectRepository(Key)
    private KeyRepository: Repository<Key>,
    @Inject(authenticationInterfaceProvider)
    private readonly authenticationService: AuthenticationInterface,
  ) {}

  async insertLogin(insertSavedLoginDto: InsertSavedLoginDto) {}

  async getKey(): Promise<KeyModel> {
    try {
      const key = await this.KeyRepository.findOne(1);
      if (key) {
        return JSON.parse(JSON.stringify(key));
      }
      throw new Error('Could not get key');
    } catch (err) {
      throw err;
    }
  }


  async EncryptLogin(insertSavedLoginDto: InsertSavedLoginDto): SavedLoginModel {
    const iv = randomBytes(16).toString('base64');

    const salt = randomBytes(16).toString('base64');

    const key = (await promisify(scrypt)(
      insertSavedLoginDto.key,
      salt,
      32,
    )) as Buffer;

    const cipher = createCipheriv('aes-256-ctr', key, iv);

    const encryptedUsername = Buffer.concat([
      cipher.update(insertSavedLoginDto.username),
      cipher.final(),
    ]);

    const encryptedPassword = Buffer.concat([
      cipher.update(insertSavedLoginDto.password),
      cipher.final(),
    ]);

    return { id: 0, username: encryptedUsername, password: encryptedPassword };
  }



}
