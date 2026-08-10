import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024,      // 200MB max file size
    fieldNestingDepth: 5,             // Prevent deeply nested field names (DoS protection)
    fields: 20,                        // Max number of form fields
    fieldSize: 1024 * 1024,            // 1MB max per field
    fieldKeySize: 100,                 // Max field name length
  },
});
