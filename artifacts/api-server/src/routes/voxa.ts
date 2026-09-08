import { Router, type Request, type Response } from "express";
import {
  CreateProductBody,
  CreateSectionBody,
  CreateSolutionBody,
  DeleteMediaBody,
  GetProductParams,
  GetSectionParams,
  GetSolutionParams,
  LoginAdminBody,
  RegisterAdminBody,
  UpdateHeroBody,
  UpdateProductBody,
  UpdateProductParams,
  UpdateSectionBody,
  UpdateSectionParams,
  UpdateSolutionBody,
  UpdateSolutionParams,
  UploadMediaBody,
} from "@workspace/api-zod";
import { now } from "../content/defaults";
import { getStore } from "../content/store";
import type { Media } from "../content/types";

const router = Router();

function sendError(res: Response, status: number, error: string) {
  res.status(status).json({ error });
}

function requireAuth(req: Request, res: Response): boolean {
  const authorization = req.headers.authorization;
  if (authorization !== "Bearer mock-voxa-token") {
    sendError(res, 401, "Authentication required");
    return false;
  }
  return true;
}

function parse<T>(
  schema: {
    safeParse: (
      value: unknown,
    ) => { success: true; data: T } | { success: false };
  },
  value: unknown,
  res: Response,
): T | null {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    sendError(res, 400, "Please check the submitted fields");
    return null;
  }
  return parsed.data;
}

router.post("/auth/login", (req, res) => {
  const body = parse(LoginAdminBody, req.body, res);
  if (!body) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || !body.password) {
    sendError(res, 400, "Enter a valid email and password");
    return;
  }
  res.json({
    token: "mock-voxa-token",
    email: body.email.toLowerCase(),
    message: "Welcome back to VOXA",
  });
});

router.post("/auth/register", (req, res) => {
  const body = parse(RegisterAdminBody, req.body, res);
  if (!body) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || body.password.length < 6) {
    sendError(res, 400, "Use a valid email and a password with 6+ characters");
    return;
  }
  res.status(201).json({ message: "Admin account ready for this mock workspace" });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Signed out" });
});

router.get("/content/summary", async (_req, res) => {
  res.json(await getStore().getSummary());
});

router.get("/content", async (_req, res) => {
  res.json(await getStore().getAll());
});

router.get("/content/hero", async (_req, res) => {
  res.json(await getStore().getHero());
});

router.post("/content/hero", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const body = parse(UpdateHeroBody, req.body, res);
  if (!body) return;
  res.json(await getStore().updateHero(body));
});

router.get("/content/products", async (_req, res) => {
  res.json(await getStore().listProducts());
});

router.post("/content/products", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const body = parse(CreateProductBody, req.body, res);
  if (!body) return;
  res.status(201).json(await getStore().createProduct(body));
});

router.get("/content/products/:id", async (req, res) => {
  const product = await getStore().getProduct(String(req.params.id ?? ""));
  if (!product) return sendError(res, 404, "Product not found");
  res.json(product);
});

router.put("/content/products/:id", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const params = parse(GetProductParams, req.params, res);
  const body = parse(UpdateProductBody, req.body, res);
  if (!params || !body) return;
  const product = await getStore().updateProduct(params.id, body);
  if (!product) return sendError(res, 404, "Product not found");
  res.json(product);
});

router.delete("/content/products/:id", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const params = parse(UpdateProductParams, req.params, res);
  if (!params) return;
  const deleted = await getStore().deleteProduct(params.id);
  if (!deleted) return sendError(res, 404, "Product not found");
  res.json({ message: "Product deleted" });
});

router.get("/content/solutions", async (_req, res) => {
  res.json(await getStore().listSolutions());
});

router.post("/content/solutions", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const body = parse(CreateSolutionBody, req.body, res);
  if (!body) return;
  res.status(201).json(await getStore().createSolution(body));
});

router.get("/content/solutions/:id", async (req, res) => {
  const solution = await getStore().getSolution(String(req.params.id ?? ""));
  if (!solution) return sendError(res, 404, "Solution not found");
  res.json(solution);
});

router.put("/content/solutions/:id", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const params = parse(GetSolutionParams, req.params, res);
  const body = parse(UpdateSolutionBody, req.body, res);
  if (!params || !body) return;
  const solution = await getStore().updateSolution(params.id, body);
  if (!solution) return sendError(res, 404, "Solution not found");
  res.json(solution);
});

router.delete("/content/solutions/:id", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const params = parse(UpdateSolutionParams, req.params, res);
  if (!params) return;
  const deleted = await getStore().deleteSolution(params.id);
  if (!deleted) return sendError(res, 404, "Solution not found");
  res.json({ message: "Solution deleted" });
});

router.get("/content/sections", async (_req, res) => {
  res.json(await getStore().listSections());
});

router.post("/content/sections", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const body = parse(CreateSectionBody, req.body, res);
  if (!body) return;
  res.status(201).json(await getStore().createSection(body));
});

router.get("/content/sections/:id", async (req, res) => {
  const section = await getStore().getSection(String(req.params.id ?? ""));
  if (!section) return sendError(res, 404, "Section not found");
  res.json(section);
});

router.put("/content/sections/:id", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const params = parse(GetSectionParams, req.params, res);
  const body = parse(UpdateSectionBody, req.body, res);
  if (!params || !body) return;
  const section = await getStore().updateSection(params.id, body);
  if (!section) return sendError(res, 404, "Section not found");
  res.json(section);
});

router.delete("/content/sections/:id", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const params = parse(UpdateSectionParams, req.params, res);
  if (!params) return;
  const deleted = await getStore().deleteSection(params.id);
  if (!deleted) return sendError(res, 404, "Section not found");
  res.json({ message: "Section deleted" });
});

router.get("/upload/media", async (_req, res) => {
  res.json(await getStore().listMedia());
});

router.post("/upload/media", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const body = parse(UploadMediaBody, req.body, res);
  if (!body) return;
  const asset: Media = {
    id: `media-${Date.now()}`,
    name: body.name,
    type: body.type,
    url:
      body.type === "image"
        ? "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85"
        : "https://cdn.coverr.co/videos/coverr-a-team-working-together-1577/1080p.mp4",
    size: body.type === "image" ? "1.2 MB" : "8.4 MB",
    createdAt: now(),
  };
  res.status(201).json(await getStore().createMedia(asset));
});

router.post("/upload/delete", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const body = parse(DeleteMediaBody, req.body, res);
  if (!body) return;
  const deleted = await getStore().deleteMedia(body.id);
  if (!deleted) return sendError(res, 404, "Media asset not found");
  res.json({ message: "Media asset deleted" });
});

export default router;
