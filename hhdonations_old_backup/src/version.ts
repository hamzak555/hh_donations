// Version file to track deployments
export const APP_VERSION = '2.0.0';
export const BUILD_DATE = new Date().toISOString();
export const FEATURES = {
  containerManagement: true,
  diagnosticTools: true,
  improvedPersistence: true,
  multiSelection: true,
  productionReady: true
};

console.info(`HH Donations v${APP_VERSION} - Built: ${BUILD_DATE}`);