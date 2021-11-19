import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
import { SavedLoginModel } from '../models/Savedlogin.model';
import { savedLoginServiceInterface } from '../interfaces/savedLoginService.interface';

@Injectable()
export class SavedLoginService implements savedLoginServiceInterface{
  constructor(
    @InjectRepository(SavedLogin)
    private savedLoginRepository: Repository<SavedLogin>,
    @InjectRepository(Key)
    private KeyRepository: Repository<Key>,
    @Inject(authenticationInterfaceProvider)
    private readonly authenticationService: AuthenticationInterface,
  ) {}

  async insertLogin(
    insertSavedLoginDto: InsertSavedLoginDto,
  ): Promise<SavedLoginModel> {
    try {
      const hashedKey = await this.getKey();
      if (hashedKey) {
        await this.authenticationService.verifyPassword(
          insertSavedLoginDto.key,
          hashedKey.password,
        );
      }
    } catch (err) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    const prevLogin = await this.savedLoginRepository.find({
      loginType: insertSavedLoginDto.loginType,
    });
    if (prevLogin) {
      await this.savedLoginRepository.remove(prevLogin);
    }
    const encryptedLogin = await this.EncryptLogin(insertSavedLoginDto);
    const newLogin = await this.savedLoginRepository.create(encryptedLogin);
    return JSON.parse(JSON.stringify(newLogin));
  }

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

  async EncryptLogin(
    insertSavedLoginDto: InsertSavedLoginDto,
  ): Promise<SavedLoginModel> {
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

    return {
      id: 0,
      username: encryptedUsername.toString('base64'),
      password: encryptedPassword.toString('base64'),
      iv: iv,
      loginType: insertSavedLoginDto.loginType,
      salt: salt,
    };
  }

  async findAllLogins(keyModel: KeyModel): Promise<SavedLoginModel> {
    try {
      const hashedKey = await this.getKey();
      if (hashedKey) {
        await this.authenticationService.verifyPassword(
          keyModel.password,
          hashedKey.password,
        );
      }
    } catch (err) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const logins = await this.savedLoginRepository.find();
      if (logins) {
        return JSON.parse(JSON.stringify(logins));
      }
      throw new Error('Could not retrieve logins');
    } catch (err) {
      throw err;
    }
  }
}
