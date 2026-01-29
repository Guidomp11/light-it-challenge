import type { Request, Response } from 'express';
import {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patient.controller';
import PatientService from '../services/patient.service';
import { DuplicateFieldError } from '../errors';
import { STATUS } from '../constants/http-status';

jest.mock('../services/patient.service');

describe('PatientController', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      file: undefined,
      protocol: 'http',
      get: jest.fn((name: string) => {
        return 'localhost:3000';
      }),
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('listPatients', () => {
    it('should return all patients', async () => {
      const mockPatients = [
        {
          id: '1',
          name: 'John Example',
          email: 'john@example.com',
          phoneNumber: '1234567890',
          documentPhotoUrl: '/uploads/documents/doc1.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest
        .spyOn(PatientService.singleton, 'listPatients')
        .mockResolvedValue(mockPatients as any);

      await listPatients(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockPatients);
    });

    it('should handle errors when listing patients', async () => {
      jest
        .spyOn(PatientService.singleton, 'listPatients')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        listPatients(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow('Database error');
    });
  });

  describe('getPatient', () => {
    it('should return a patient by id with absolute URL', async () => {
      const mockPatient = {
        id: '1',
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const patientWithAbsoluteUrl = {
        ...mockPatient,
        documentPhotoUrl: 'http://localhost:3000/uploads/documents/doc1.jpg',
      };

      mockRequest.params = { id: '1' };

      jest
        .spyOn(PatientService.singleton, 'getPatient')
        .mockResolvedValue(mockPatient as any);

      jest
        .spyOn(PatientService.singleton, 'getAbsolutePhotoUrl')
        .mockReturnValue(patientWithAbsoluteUrl as any);

      await getPatient(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(patientWithAbsoluteUrl);
    });

    it('should return 404 when patient is not found', async () => {
      mockRequest.params = { id: '999' };

      jest
        .spyOn(PatientService.singleton, 'getPatient')
        .mockResolvedValue(null as any);

      await getPatient(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(STATUS.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Patient not found',
      });
    });
  });

  describe('createPatient', () => {
    it('should create a patient with file upload', async () => {
      const mockFile = {
        filename: 'document.jpg',
      } as Express.Multer.File;

      const mockPatient = {
        id: '1',
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/document.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = {
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
      };
      mockRequest.file = mockFile;

      jest
        .spyOn(PatientService.singleton, 'buildFileUrl')
        .mockReturnValue('/uploads/documents/document.jpg');

      jest
        .spyOn(PatientService.singleton, 'createPatient')
        .mockResolvedValue(mockPatient as any);

      await createPatient(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(STATUS.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPatient);
      expect(PatientService.singleton.buildFileUrl).toHaveBeenCalledWith(
        'document.jpg'
      );
    });

    it('should return 400 when documentPhoto is missing', async () => {
      mockRequest.body = {
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
      };
      mockRequest.file = undefined;

      await createPatient(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(STATUS.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'documentPhoto is required',
        })
      );
    });

    it('should handle duplicate field error', async () => {
      const mockFile = {
        filename: 'document.jpg',
      } as Express.Multer.File;

      mockRequest.body = {
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
      };
      mockRequest.file = mockFile;

      jest
        .spyOn(PatientService.singleton, 'buildFileUrl')
        .mockReturnValue('/uploads/documents/document.jpg');

      jest
        .spyOn(PatientService.singleton, 'createPatient')
        .mockRejectedValue(
          new DuplicateFieldError('Email already registered')
        );

      await createPatient(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(STATUS.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email already registered',
      });
    });
  });

  describe('updatePatient', () => {
    it('should update a patient without file', async () => {
      const mockPatient = {
        id: '1',
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPatient = {
        ...mockPatient,
        name: 'Jane Doe',
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'Jane Doe',
      };
      mockRequest.file = undefined;

      jest
        .spyOn(PatientService.singleton, 'getPatient')
        .mockResolvedValue(mockPatient as any);

      jest
        .spyOn(PatientService.singleton, 'updatePatient')
        .mockResolvedValue(updatedPatient as any);

      await updatePatient(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(updatedPatient);
    });

    it('should update a patient with file', async () => {
      const mockFile = {
        filename: 'new-document.jpg',
      } as Express.Multer.File;

      const mockPatient = {
        id: '1',
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPatient = {
        ...mockPatient,
        documentPhotoUrl: '/uploads/documents/new-document.jpg',
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'John Example',
      };
      mockRequest.file = mockFile;

      jest
        .spyOn(PatientService.singleton, 'getPatient')
        .mockResolvedValue(mockPatient as any);

      jest
        .spyOn(PatientService.singleton, 'buildFileUrl')
        .mockReturnValue('/uploads/documents/new-document.jpg');

      jest
        .spyOn(PatientService.singleton, 'updatePatient')
        .mockResolvedValue(updatedPatient as any);

      await updatePatient(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(updatedPatient);
      expect(PatientService.singleton.buildFileUrl).toHaveBeenCalledWith(
        'new-document.jpg'
      );
    });

    it('should return 404 when patient is not found', async () => {
      mockRequest.params = { id: '999' };

      jest
        .spyOn(PatientService.singleton, 'getPatient')
        .mockResolvedValue(null as any);

      await updatePatient(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(STATUS.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Patient not found',
      });
    });

    it('should handle duplicate field error on update', async () => {
      const mockPatient = {
        id: '1',
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        email: 'existing@example.com',
      };
      mockRequest.file = undefined;

      jest
        .spyOn(PatientService.singleton, 'getPatient')
        .mockResolvedValue(mockPatient as any);

      jest
        .spyOn(PatientService.singleton, 'updatePatient')
        .mockRejectedValue(
          new DuplicateFieldError('Email already exists')
        );

      await updatePatient(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(STATUS.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email already exists',
      });
    });
  });

  describe('deletePatient', () => {
    it('should delete a patient', async () => {
      const mockPatient = {
        id: '1',
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.params = { id: '1' };

      jest
        .spyOn(PatientService.singleton, 'getPatient')
        .mockResolvedValue(mockPatient as any);

      jest
        .spyOn(PatientService.singleton, 'deletePatient')
        .mockResolvedValue(true as any);

      await deletePatient(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(STATUS.NO_CONTENT);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 when patient is not found', async () => {
      mockRequest.params = { id: '999' };

      jest
        .spyOn(PatientService.singleton, 'getPatient')
        .mockResolvedValue(null as any);

      await deletePatient(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(STATUS.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Patient not found',
      });
    });
  });
});