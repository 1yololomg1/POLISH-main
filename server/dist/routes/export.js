"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.exportRoutes = router;
/**
 * POST /api/export/las
 * Export processed LAS file
 */
router.post('/las', auth_1.authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'LAS export endpoint - implementation pending'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Export failed'
        });
    }
});
//# sourceMappingURL=export.js.map