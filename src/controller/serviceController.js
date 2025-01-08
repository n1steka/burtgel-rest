import ServiceModel from "../model/ServiceModel.js";
import CategoryModel from "../model/categoryModel.js";
import { PrismaClient } from "@prisma/client";
import { errorResponse, successResponse } from "../middleware/Reponse.js";
import { generateEAN13Code } from "../utils/fn.js";

const prisma = new PrismaClient();

export class ServiceController {
  async detail(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "Service ID is required" });
      }
      if (id === "add") {
        const category = await CategoryModel.list({
          pageSize: 200,
        });
        return successResponse(
          res,
          200,
          { service: null, category },
          "Service details fetched successfully"
        );
      }
      const parsedId = parseInt(id);

      const service = await prisma.services.findUnique({
        where: {
          id: parsedId,
        },
      });

      const category = await CategoryModel.list({
        pageSize: 100,
      });
      const data = {
        service: service ? service : null,
        category,
      };

      return successResponse(
        res,
        200,
        data,
        "Service details fetched successfully"
      );
    } catch (error) {
      console.error("Error getting service details:", error);
      return errorResponse(res, 500, "Failed to get service details");
    }
  }

  async deleteService(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return errorResponse(res, 400, "Service ID is required");
      }

      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        return errorResponse(res, 400, "Invalid service ID format");
      }

      const service = await ServiceModel.get(parsedId);
      if (!service) {
        return errorResponse(res, 404, "service not found");
      }

      const deletedservice = await ServiceModel.delete(parsedId);

      return successResponse(
        res,
        200,
        deletedservice,
        "service deleted successfully"
      );
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      if (id !== "add") {
        const existingservice = await ServiceModel.get(parseInt(id));
        if (!existingservice) {
          return errorResponse(res, 404, "service not found");
        }
        // Remove unnecessary fields before update
        delete data.id;
        delete data.createdat;
        delete data.updatedat;

        if (data.categoryid) {
          data.category = {
            connect: { id: parseInt(data.categoryid) },
          };
          delete data.categoryid;
        }

        const service = await ServiceModel.update(parseInt(id, 10), data);

        return successResponse(
          res,
          200,
          service,
          "service updated successfully"
        );
      } else if (id === "add") {
        try {
          const serviceData = {
            ezemshigchiin_ner: req.body.ezemshigchiin_ner,
            turul: req.body.turul,
            description: req.body.description,
            category: {
              connect: { id: +req.body.categoryid },
            },
          };
          const service = await ServiceModel.create(serviceData);

          return successResponse(
            res,
            201,
            service,
            "service created successfully"
          );
        } catch (error) {
          return errorResponse(res, 500, error.message);
        }
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
  async list(req, res) {
    try {
      let where = {};
      if (req.query.categoryId) {
        where.categoryid = +req.query.categoryId;
      }

      if (req.query.ezemshigchiin_ner) {
        where.ezemshigchiin_ner = { contains: req.query.ezemshigchiin_ner };
      }

      if (req.query.createdat) {
        where.createdat = {
          gte: new Date(req.query.createdat),
        };
      }

      if (req.query.turul) {
        where.turul = { contains: req.query.turul };
      }

      const services = await ServiceModel.list({
        page: req.query.page || 1,
        pageSize: req.query.pageSize || 100,
        where,
        include: {
          category: true,
        },
      });
      return successResponse(
        res,
        200,
        services,
        "Active services fetched successfully"
      );
    } catch (error) {
      console.error("Error getting active services:", error);
      return errorResponse(res, 500, "Failed to get active services");
    }
  }
}
