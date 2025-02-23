import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { processReceipt } from "./openai";
import { z } from "zod";
import { insertGroupSchema, insertBillSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/groups", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const groups = await storage.getUserGroups(req.user.id);
    res.json(groups);
  });

  app.post("/api/groups", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const parsed = insertGroupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    
    const group = await storage.createGroup(parsed.data.name, req.user.id);
    res.json(group);
  });

  app.post("/api/groups/:id/members", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const { userId, symbol } = req.body;
    const groupId = parseInt(req.params.id);
    
    const member = await storage.addGroupMember(groupId, userId, symbol);
    res.json(member);
  });

  app.get("/api/groups/:id/members", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const groupId = parseInt(req.params.id);
    const members = await storage.getGroupMembers(groupId);
    res.json(members);
  });

  app.post("/api/groups/:id/bills", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const groupId = parseInt(req.params.id);
    const { receipt, ...rest } = req.body;

    if (receipt) {
      const members = await storage.getGroupMembers(groupId);
      const symbols = members.map(m => m.symbol);
      const result = await processReceipt(receipt, symbols);
      
      const splits = result.splits.map(split => ({
        userId: members.find(m => m.symbol === split.symbol)!.userId,
        amount: split.amount
      }));

      const bill = await storage.createBill({
        groupId,
        total: result.total,
        splits,
        receiptUrl: receipt,
        createdAt: new Date().toISOString()
      });

      res.json(bill);
    } else {
      const parsed = insertBillSchema.safeParse({ ...rest, groupId });
      if (!parsed.success) return res.status(400).json(parsed.error);
      
      const bill = await storage.createBill({
        ...parsed.data,
        createdAt: new Date().toISOString()
      });
      res.json(bill);
    }
  });

  app.get("/api/groups/:id/bills", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const groupId = parseInt(req.params.id);
    const bills = await storage.getGroupBills(groupId);
    res.json(bills);
  });

  const httpServer = createServer(app);
  return httpServer;
}
