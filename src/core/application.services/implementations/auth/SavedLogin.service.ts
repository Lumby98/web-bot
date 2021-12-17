import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SavedLogin } from '../../../../infrastructure/entities/Savedlogin.entity';
import { Repository } from 'typeorm';
import { Key } from '../../../../infrastructure/entities/key';
import {
  AuthenticationInterface,
  authenticationInterfaceProvider,
} from '../../interfaces/auth/authentication.interface';
import { InsertSavedLoginDto } from '../../../../ui.api/dto/savedLogin/insert-SavedLogin.dto';
import { KeyModel } from '../../../models/key.model';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { SavedLoginModel } from '../../../models/Savedlogin.model';
import { savedLoginServiceInterface } from '../../interfaces/auth/savedLoginService.interface';
import { SavedLoginDto } from '../../../../ui.api/dto/savedLogin/SavedLoginDto';
import { LoginTypeEnum } from '../../../enums/loginType.enum';
import { InsertKeyDto } from '../../../../ui.api/dto/savedLogin/insert-Key.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SavedLoginService implements savedLoginServiceInterface {
  constructor(
    @InjectRepository(Key)
    private keyRepository: Repository<Key>,
    @InjectRepository(SavedLogin)
    private savedLoginRepository: Repository<SavedLogin>,
    @Inject(authenticationInterfaceProvider)
    private readonly authenticationService: AuthenticationInterface,
  ) {}

  async insertLogin(
    insertSavedLoginDto: InsertSavedLoginDto,
  ): Promise<SavedLoginModel> {
    await this.verifyKey(insertSavedLoginDto.key);

    console.log('logintype:' + insertSavedLoginDto.loginType);
    const prevLogin = await this.savedLoginRepository.findOne({
      loginType: insertSavedLoginDto.loginType,
    });

    console.log(prevLogin);
    if (prevLogin) {
      await this.savedLoginRepository.remove(prevLogin);
      const encryptedLogin = await this.encryptLogin(insertSavedLoginDto);
      const newLogin = await this.savedLoginRepository.create(encryptedLogin);
      await this.savedLoginRepository.save(newLogin);
      return JSON.parse(JSON.stringify(newLogin));
    } else {
      const encryptedLogin = await this.encryptLogin(insertSavedLoginDto);
      const newLogin = await this.savedLoginRepository.create(encryptedLogin);
      await this.savedLoginRepository.save(newLogin);
      return JSON.parse(JSON.stringify(newLogin));
    }
  }

  async verifyKey(key: string) {
    try {
      const hashedKey = await this.getKey();
      if (hashedKey) {
        await this.authenticationService.verifyPassword(
          key,
          hashedKey.password,
        );
      }
    } catch (err) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async changeKey(inserKeyDto: InsertKeyDto) {
    try {
      const decryptedLogins = await this.findAllLogins(
        inserKeyDto.prevPassword,
      );

      const currentKey = await this.keyRepository.findOne(1);
      if (currentKey) {
        const hashedKey = await bcrypt.hash(inserKeyDto.password, 10);

        await this.keyRepository.update(
          { id: currentKey.id },
          { password: hashedKey },
        );
        await this.getKey();

        for (const decryptedLogin of decryptedLogins) {
          await this.insertLogin({
            loginType: decryptedLogin.loginType,
            username: decryptedLogin.username,
            password: decryptedLogin.password,
            key: inserKeyDto.password,
          });
        }
      } else {
        throw new Error('Could not get key');
      }
    } catch (err) {
      throw err;
    }
  }

  async getKey(): Promise<KeyModel> {
    try {
      const key = await this.keyRepository.findOne(1);
      if (key) {
        return JSON.parse(JSON.stringify(key));
      }
      throw new Error('Could not get key');
    } catch (err) {
      throw err;
    }
  }

  async encryptLogin(
    insertSavedLoginDto: InsertSavedLoginDto,
  ): Promise<SavedLoginModel> {
    const iv = randomBytes(16);

    const salt = randomBytes(16).toString('base64');

    const key = (await promisify(scrypt)(
      insertSavedLoginDto.key,
      salt,
      32,
    )) as Buffer;

    const cipherUsername = createCipheriv('aes-256-ctr', key, iv);

    const encryptedUsername = Buffer.concat([
      cipherUsername.update(insertSavedLoginDto.username),
      cipherUsername.final(),
    ]);

    const cipherPassword = createCipheriv('aes-256-ctr', key, iv);

    const encryptedPassword = Buffer.concat([
      cipherPassword.update(insertSavedLoginDto.password),
      cipherPassword.final(),
    ]);

    return {
      id: 0,
      username: encryptedUsername.toString('base64'),
      password: encryptedPassword.toString('base64'),
      iv: iv.toString('base64'),
      loginType: insertSavedLoginDto.loginType,
      salt: salt,
    };
  }

  async decryptLogin(
    savedlogin: SavedLoginModel,
    key: string,
  ): Promise<SavedLoginDto> {
    const hashedKey = (await promisify(scrypt)(
      key,
      savedlogin.salt,
      32,
    )) as Buffer;

    const decipherUsername = createDecipheriv(
      'aes-256-ctr',
      hashedKey,
      Buffer.from(savedlogin.iv, 'base64'),
    );

    const decryptedUsername = Buffer.concat([
      decipherUsername.update(Buffer.from(savedlogin.username, 'base64')),
      decipherUsername.final(),
    ]);

    const decipherPassword = createDecipheriv(
      'aes-256-ctr',
      hashedKey,
      Buffer.from(savedlogin.iv, 'base64'),
    );

    const decryptedPassword = Buffer.concat([
      decipherPassword.update(Buffer.from(savedlogin.password, 'base64')),
      decipherPassword.final(),
    ]);

    return {
      id: savedlogin.id,
      username: decryptedUsername.toString(),
      password: decryptedPassword.toString(),
      loginType: savedlogin.loginType,
    };
  }

  async getLogin(
    loginType: LoginTypeEnum,
    key: string,
  ): Promise<SavedLoginDto> {
    try {
      const login = await this.savedLoginRepository.findOne({
        loginType: loginType,
      });

      if (login) {
        return await this.decryptLogin(login, key);
      }

      throw new Error('Could not find login with this type');
    } catch (err) {
      throw err;
    }
  }

  async findAllLogins(key: string): Promise<SavedLoginDto[]> {
    await this.verifyKey(key);
    try {
      const logins = await this.savedLoginRepository.find();
      if (logins) {
        const decryptedLogins = Array<SavedLoginDto>();
        for (const login of logins) {
          decryptedLogins.push(await this.decryptLogin(login, key));
        }
        return decryptedLogins;
      }
      throw new Error('Could not retrieve logins');
    } catch (err) {
      throw err;
    }
  }
}
