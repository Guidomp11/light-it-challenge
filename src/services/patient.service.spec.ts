import PatientService from '../services/patient.service';
import { DuplicateFieldError } from '../errors';
import { addEmailToQueue } from '../libs/queues/emailQueue';
import fs from 'fs';

jest.mock('fs');
jest.mock('../libs/queues/emailQueue');

describe('PatientService', () => {
  let patientService: PatientService;

  beforeEach(() => {
    jest.clearAllMocks();
    (addEmailToQueue as unknown as jest.Mock).mockResolvedValue(undefined);
    patientService = new PatientService();
  });

  describe('listPatients', () => {
    it('should return all patients ordered by createdAt DESC', async () => {
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
        .spyOn(patientService, 'findAll')
        .mockResolvedValue(mockPatients as any);

      const result = await patientService.listPatients();

      expect(result).toEqual(mockPatients);
      expect(patientService.findAll).toHaveBeenCalledWith(undefined, {
        createdAt: 'DESC',
      });
    });

    it('should handle errors when listing patients', async () => {
      jest
        .spyOn(patientService, 'findAll')
        .mockRejectedValue(new Error('Database error'));

      await expect(patientService.listPatients()).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getPatient', () => {
    it('should return a patient by id', async () => {
      const mockPatient = {
        id: '1',
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
      };

      jest
        .spyOn(patientService, 'findById')
        .mockResolvedValue(mockPatient as any);

      const result = await patientService.getPatient('1');

      expect(result).toEqual(mockPatient);
      expect(patientService.findById).toHaveBeenCalledWith('1');
    });

    it('should return null when patient is not found', async () => {
      jest
        .spyOn(patientService, 'findById')
        .mockResolvedValue(null as any);

      const result = await patientService.getPatient('999');

      expect(result).toBeNull();
    });
  });

  describe('getAbsolutePhotoUrl', () => {
    it('should return patient with absolute photo URL', () => {
      const mockPatient = {
        id: '1',
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = patientService.getAbsolutePhotoUrl(
        mockPatient as any,
        'http://localhost:3000'
      );

      expect(result.documentPhotoUrl).toBe(
        'http://localhost:3000/uploads/documents/doc1.jpg'
      );
    });
  });

  describe('buildFileUrl', () => {
    it('should build correct file URL', () => {
      const result = patientService.buildFileUrl('document.jpg');

      expect(result).toBe('/uploads/documents/document.jpg');
    });
  });

  describe('createPatient', () => {
    it('should create a patient successfully and queue email', async () => {
      const input = {
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
      };

      const mockPatient = {
        id: '1',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(patientService, 'create')
        .mockResolvedValue(mockPatient as any);

      const result = await patientService.createPatient(input);

      expect(result).toEqual(mockPatient);
      expect(patientService.create).toHaveBeenCalledWith(input);
      expect(addEmailToQueue).toHaveBeenCalledWith(
        'john@example.com',
        'John Example',
        expect.stringContaining('Welcome')
      );
    });

    it('should handle duplicate field error', async () => {
      const input = {
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
      };

      jest
        .spyOn(patientService, 'create')
        .mockRejectedValue({ code: '23505' });

      await expect(patientService.createPatient(input)).rejects.toThrow(
        DuplicateFieldError
      );
    });

    it('should re-throw non-duplicate errors', async () => {
      const input = {
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
      };

      jest
        .spyOn(patientService, 'create')
        .mockRejectedValue(new Error('Database error'));

      await expect(patientService.createPatient(input)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('updatePatient', () => {
    it('should update a patient successfully', async () => {
      const existingPatient = {
        id: '1',
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
      };

      const updateInput = {
        name: 'Jane Doe',
      };

      const updatedPatient = {
        ...existingPatient,
        ...updateInput,
      };

      jest
        .spyOn(patientService, 'findById')
        .mockResolvedValue(existingPatient as any);
      jest
        .spyOn(patientService, 'update')
        .mockResolvedValue(updatedPatient as any);
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await patientService.updatePatient('1', updateInput);

      expect(result).toEqual(updatedPatient);
      expect(patientService.update).toHaveBeenCalled();
    });

    it('should return null when patient is not found', async () => {
      jest
        .spyOn(patientService, 'findById')
        .mockResolvedValue(null as any);

      const result = await patientService.updatePatient('999', {
        name: 'Jane',
      });

      expect(result).toBeNull();
    });

    it('should handle duplicate field error on update', async () => {
      const existingPatient = {
        id: '1',
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
      };

      jest
        .spyOn(patientService, 'findById')
        .mockResolvedValue(existingPatient as any);
      jest
        .spyOn(patientService, 'update')
        .mockRejectedValue({ code: '23505' });

      await expect(
        patientService.updatePatient('1', { email: 'existing@example.com' })
      ).rejects.toThrow(DuplicateFieldError);
    });
  });

  describe('deletePatient', () => {
    it('should delete a patient successfully', async () => {
      const mockPatient = {
        id: '1',
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
      };

      jest
        .spyOn(patientService, 'findById')
        .mockResolvedValue(mockPatient as any);
      jest
        .spyOn(patientService, 'delete')
        .mockResolvedValue({} as any);
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await patientService.deletePatient('1');

      expect(patientService.delete).toHaveBeenCalledWith('1');
    });

    it('should delete associated file when deleting patient', async () => {
      const mockPatient = {
        id: '1',
        name: 'John Example',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        documentPhotoUrl: '/uploads/documents/doc1.jpg',
      };

      jest
        .spyOn(patientService, 'findById')
        .mockResolvedValue(mockPatient as any);
      jest
        .spyOn(patientService, 'delete')
        .mockResolvedValue({} as any);
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await patientService.deletePatient('1');

      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('should return null when patient is not found', async () => {
      jest
        .spyOn(patientService, 'findById')
        .mockResolvedValue(null as any);

      const result = await patientService.deletePatient('999');

      expect(result).toBeNull();
    });
  });
});