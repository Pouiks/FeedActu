import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PublicationService } from '../services/publicationService';

describe('Publication Flow Security', () => {
  test('should block unauthorized residence selection', async () => {
    const mockUser = {
      email: 'test@example.com',
      authorizedResidences: ['residence-1']
    };
    
    // Test tentative d'accès non autorisé
    const unauthorizedData = {
      targetResidences: ['residence-1', 'unauthorized-residence'],
      title: 'Test'
    };

    await expect(
      PublicationService.createPublication('post', unauthorizedData)
    ).rejects.toThrow('Résidences non autorisées');
  });

  test('should log complete publication flow', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    const validData = {
      targetResidences: ['residence-1'],
      title: 'Test Post',
      message: 'Test content'
    };

    await PublicationService.createPublication('post', validData);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('PREPARING post'),
      expect.any(Object)
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('API_PAYLOAD_READY'),
      expect.any(Object)
    );
  });
}); 