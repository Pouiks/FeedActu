import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PublicationLogger } from '../utils/publicationLogger';

describe('Publication Flow Security', () => {
  const mockUserContext = {
    user: {
      email: 'test@example.com',
      userId: 'user-123',
      residenceId: 'residence-1'
    },
    authorizedResidences: [
      { residenceId: 'residence-1', name: 'Résidence 1' }
    ]
  };

  test('should block unauthorized residence selection', async () => {
    const unauthorizedData = {
      targetResidences: ['residence-1', 'unauthorized-residence'],
      title: 'Test'
    };

    const securityCheck = PublicationLogger.validateSecurity(
      unauthorizedData,
      mockUserContext.authorizedResidences
    );

    expect(securityCheck.isValid).toBe(false);
    expect(securityCheck.unauthorizedAttempt).toContain('unauthorized-residence');
    expect(securityCheck.securityLevel).toBe('CRITICAL');
  });

  test('should log complete publication flow', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    const validData = {
      targetResidences: ['residence-1'],
      title: 'Test Post',
      message: 'Test content'
    };

    // Test du flux complet de publication
    const phases = ['PREPARING', 'VALIDATING', 'SENDING', 'SUCCESS'];
    
    for (const phase of phases) {
      PublicationLogger.logPublication(
        'post',
        validData,
        phase,
        mockUserContext
      );
    }
    
    // Vérification des logs
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('📋 [PREPARING] POST:'),
      expect.any(Object)
    );
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('✅ [SUCCESS] POST:'),
      expect.any(Object)
    );

    // Vérification de la structure des données
    const lastCall = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    const logEntry = lastCall[1];
    
    expect(logEntry).toMatchObject({
      phase: 'SUCCESS',
      type: 'post',
      user: {
        email: 'test@example.com',
        userId: 'user-123',
        currentResidence: 'residence-1'
      },
      apiPayload: expect.objectContaining({
        title: 'Test Post',
        message: 'Test content',
        targetResidences: ['residence-1']
      }),
      security: expect.objectContaining({
        isValid: true,
        securityLevel: 'OK'
      })
    });
  });

  test('should handle different publication types correctly', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    const eventData = {
      targetResidences: ['residence-1'],
      title: 'Test Event',
      startDate: '2024-03-20',
      endDate: '2024-03-21',
      location: 'Salle commune'
    };

    PublicationLogger.logPublication(
      'event',
      eventData,
      'PREPARING',
      mockUserContext
    );

    const logEntry = consoleSpy.mock.calls[0][1];
    
    expect(logEntry.apiPayload).toMatchObject({
      type: 'event',
      title: 'Test Event',
      startDate: '2024-03-20',
      endDate: '2024-03-21',
      location: 'Salle commune',
      // Vérification des champs par défaut
      capacity: null,
      registrationRequired: false,
      recurring: false
    });
  });
}); 