import { handleUpload } from '../middlewares/upload';
import type { Request, Response, NextFunction } from 'express';
import { STATUS } from '../constants/http-status';

describe('Middleware - handleUpload', () => {
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

  it('should call next when upload is successful', () => {
    handleUpload(
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    );

    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 400 when upload has error', () => {
    const { uploadDocumentPhoto } = require('../config/multer');
    uploadDocumentPhoto.mockImplementationOnce((req: any, res: any, callback: any) => {
      callback(new Error('File size exceeds limit'));
    });

    handleUpload(
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(STATUS.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'File size exceeds limit',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle non-Error upload errors', () => {
    const { uploadDocumentPhoto } = require('../config/multer');
    uploadDocumentPhoto.mockImplementationOnce((req: any, res: any, callback: any) => {
      callback({ message: 'Some error' });
    });

    handleUpload(
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(STATUS.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'File upload error',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
