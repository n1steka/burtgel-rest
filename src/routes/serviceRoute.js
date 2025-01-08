import express from "express";
import { ServiceController } from "../controller/serviceController.js";
const serviceController = new ServiceController();
const router = express.Router();

// router.post("/service", serviceController.create);
router.put("/service/:id", serviceController.update);
router.get("/service/:id", serviceController.detail);
router.delete("/service/:id", serviceController.deleteService);
router.get("/services", serviceController.list);

export default router;
