// Temporary in-memory storage for access codes
// TODO: Remove this when access_code column is added to Experiment table
const experienceAccessCodes = new Map();

export const storeAccessCode = (experimentId, accessCode) => {
    experienceAccessCodes.set(experimentId.toString(), accessCode);
    console.log(`📝 Stored access code for experiment ${experimentId}:`, accessCode);
};

export const getAccessCode = (experimentId) => {
    const code = experienceAccessCodes.get(experimentId.toString());
    console.log(`🔍 Retrieved access code for experiment ${experimentId}:`, code || 'NOT FOUND');
    return code;
};

export const validateAccessCode = (experimentId, providedCode) => {
    const storedCode = experienceAccessCodes.get(experimentId.toString());
    const isValid = storedCode === providedCode;
    console.log(`✅ Access code validation for experiment ${experimentId}:`, isValid ? 'VALID' : 'INVALID');
    return isValid;
};

export const clearAccessCode = (experimentId) => {
    experienceAccessCodes.delete(experimentId.toString());
    console.log(`🗑️ Cleared access code for experiment ${experimentId}`);
};
