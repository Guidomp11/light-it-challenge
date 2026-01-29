import { errorHandler } from '../middlewares/errorHandler';
import { notFound } from '../middlewares/notFound';
import { ZodError } from 'zod';
import { STATUS } from '../constants/http-status';
import type { Request, Response, NextFunction } from 'express';

describe('Middleware - errorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle ZodError validation errors', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['email'],
          message: 'Expected string, received number',
        },
      ]);

      errorHandler(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(STATUS.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        issues: expect.any(Array),
      });
    });

    it('should handle Error instances', () => {
      const error = new Error('Something went wrong');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(
        STATUS.INTERNAL_SERVER_ERROR
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Something went wrong',
      });
    });

    it('should handle unknown error types', () => {
      const unknownError = 'Unknown error';

      errorHandler(
        unknownError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(
        STATUS.INTERNAL_SERVER_ERROR
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unexpected error',
      });
    });
  });

  describe('notFound', () => {
    it('should return 404 with error message', () => {
      notFound(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(STATUS.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Not Found',
      });
    });
  });
});
