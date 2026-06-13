// src/data/vso-seed-data.ts
// Seed data for VSO Claims modules - pre-loaded on first initialization.
//
// IMPORTANT: This file ships in the public client bundle. It MUST contain only
// generic, non-personal example data. Never put real medical, military, or
// personally identifying information here.
import { v4 as uuidv4 } from 'uuid';
import type { VSOData } from '../types/data.types';

export const getVSOSeedData = (): VSOData => {
  const now = Date.now();

  return {
    claims: [
      {
        id: uuidv4(),
        claimName: 'Example Claim — Edit or delete me',
        conditionClaimed: 'Sample condition',
        icd10: '',
        diagnosticCode: '',
        claimType: 'direct',
        claimTrack: 'tera-toxic-exposure',
        status: 'planning',
        theoryOfConnection:
          'This is an example claim to show how the VSO Claims feature works. Replace the fields with your own claim details, or delete this entry.',
        inServiceEvent: 'Describe the in-service event or exposure here.',
        notes: 'You can track theories, deadlines, and status for each claim.',
        createdAt: now,
        updatedAt: now,
      },
    ],
    evidence: [
      {
        id: uuidv4(),
        evidenceName: 'Example Evidence — Edit or delete me',
        evidenceType: 'medical-record',
        status: 'needed',
        priority: 'moderate',
        linkedClaimNames: 'Example Claim — Edit or delete me',
        source: 'e.g., VA medical center, private physician',
        description: 'Track documents you have or still need for each claim.',
        createdAt: now,
        updatedAt: now,
      },
    ],
    actions: [
      {
        id: uuidv4(),
        actionItem: 'Example Action — Edit or delete me',
        phase: 'phase-1-foundation',
        priority: 'moderate',
        status: 'not-started',
        notes: 'Use actions to plan the steps for filing and developing a claim.',
        createdAt: now,
        updatedAt: now,
      },
    ],
    exposures: [
      {
        id: uuidv4(),
        exposureType: 'other',
        substance: 'Example exposure — edit or delete me',
        weaponSystem: '',
        description: 'Document occupational or environmental exposures here.',
        frequency: '',
        duration: '',
        ppeProvided: '',
        linkedClaimNames: 'Example Claim — Edit or delete me',
        createdAt: now,
        updatedAt: now,
      },
    ],
    ratings: [
      {
        id: uuidv4(),
        diagnosticCode: '',
        conditionName: 'Example Rating Criteria — Edit or delete me',
        ratingPercent: 0,
        criteria: 'Record the rating-schedule criteria you are working toward.',
        currentlyMet: 'unknown-need-testing',
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
};
