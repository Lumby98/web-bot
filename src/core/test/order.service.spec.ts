import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../service/order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HultaforsProduct } from '../../infrastructure/entities/hultafors.product.entity';
import { Repository } from 'typeorm';
import {
  OrderPuppeteerInterface,
  orderPuppeteerInterfaceProvider,
} from '../interfaces/order-puppeteer.interface';
import { OrderPuppeteerService } from '../service/order-puppeteer.service';
import { OrderModel } from '../models/order.model';
import { STSOrderModel } from '../models/sts-order.model';

jest.mock('src/core/service/order-puppeteer.service.ts');

describe('OrderService', () => {
  let orderService: OrderService;
  let orderPuppeteerService: OrderPuppeteerInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        OrderPuppeteerService,
        {
          provide: orderPuppeteerInterfaceProvider,
          useClass: OrderPuppeteerService,
        },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    orderPuppeteerService = module.get<OrderPuppeteerService>(
      OrderPuppeteerService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(orderService).toBeDefined();
  });

  describe('startPuppeteer', () => {
    const validURL = 'https://www.google.com/';

    describe('when startPuppeteer is called with a valid url', () => {
      beforeEach(async () => {
        await orderService.startPuppeteer(validURL);
      });

      it('should call the order-puppeteer.service start method with the right arguments', async () => {
        expect(orderPuppeteerService.start).toBeCalledWith(false, validURL);
      });
    });

    describe('when startPuppeteer is called with an empty string', () => {
      const emptyURL = '';
      beforeEach(async () => {
        await orderService.startPuppeteer(emptyURL);
      });

      it('should not call the puppeter service start method', async () => {
        expect(orderPuppeteerService.start).toBeCalledTimes(0);
      });

      it('should throw an error with the right message', async () => {
        await expect(orderService.startPuppeteer).rejects.toThrow(
          'Invalid url, the given url is empty',
        );
      });
    });

    describe('when startPuppeteer is called with an invalid url', () => {
      const invalidURL = 'www.yahoo.com';
      beforeEach(async () => {
        await orderService.startPuppeteer(invalidURL);
      });

      it('should not call the puppeter service start method', async () => {
        expect(orderPuppeteerService.start).toBeCalledTimes(0);
      });

      it('should throw an error with the right message', async () => {
        await expect(orderService.startPuppeteer).rejects.toThrow(
          'Invalid url, the given url is invalid.',
        );
      });
    });
  });

  describe('stopPuppeteer', () => {
    describe('when stopPuppeteer is called', () => {
      beforeEach(async () => {
        await orderService.stopPuppeteer();
      });

      it('should call the order-puppeteer.service stop method', async () => {
        expect(orderPuppeteerService.stop).toBeCalled();
      });
    });
  });

  describe('handleOrtowearNavigation', () => {
    const validUsername = 'test@gmail.dk';
    const validPassword = 'test$Password99';
    describe('when handleOrtowearNavigation is called with a valid username and password', () => {
      beforeEach(async () => {
        await orderService.handleOrtowearNavigation(
          validUsername,
          validPassword,
        );
      });

      it('should call order-puppeter.service loginOrtowear method with the right arguments', async () => {
        expect(orderPuppeteerService.loginOrtowear).toBeCalledWith(
          validUsername,
          validPassword,
        );
      });
    });

    describe('when handleOrtowearNavigation is called with an empty username', () => {
      const emptyUsername = '';
      beforeEach(async () => {
        await orderService.handleOrtowearNavigation(
          emptyUsername,
          validPassword,
        );
      });

      it('should not call the puppeter service loginOrtowear method ', async () => {
        expect(orderPuppeteerService.loginOrtowear).toBeCalledTimes(0);
      });

      it('should throw an error with the right message', async () => {
        await expect(orderService.handleOrtowearNavigation).rejects.toThrow(
          'Invalid username or password',
        );
      });
    });

    describe('when handleOrtowearNavigation is called with an empty password', () => {
      const emptyPassword = '';
      beforeEach(async () => {
        await orderService.handleOrtowearNavigation(
          validUsername,
          emptyPassword,
        );
      });

      it('should not call the puppeter service loginOrtowear method ', async () => {
        expect(orderPuppeteerService.loginOrtowear).toBeCalledTimes(0);
      });

      it('should throw an error with the right message', async () => {
        await expect(orderService.handleOrtowearNavigation).rejects.toThrow(
          'Invalid username or password',
        );
      });
    });

    describe('when handleOrtowearNavigation is called with an invalid username', () => {
      const invalidUsername = 'joe@123aspx.com';
      beforeEach(async () => {
        await orderService.handleOrtowearNavigation(
          invalidUsername,
          validPassword,
        );
      });

      it('should not call the puppeter service loginOrtowear method ', async () => {
        expect(orderPuppeteerService.loginOrtowear).toBeCalledTimes(0);
      });

      it('should throw an error with the right message', async () => {
        await expect(orderService.handleOrtowearNavigation).rejects.toThrow(
          'Invalid username or password',
        );
      });
    });

    describe('when handleOrtowearNavigation is called with and puppeteer throws an error', () => {
      beforeEach(async () => {
        jest
          .spyOn(orderPuppeteerService, 'loginOrtowear')
          .mockImplementationOnce(() => {
            throw new Error('Failed to login, wrong username or password');
          });
      });

      it('should throw an error with the right message', async () => {
        await expect(
          async () =>
            await orderService.handleOrtowearNavigation(
              validUsername,
              validPassword,
            ),
        ).rejects.toThrow('Failed to login, wrong username or password');
      });
    });
  });
});
