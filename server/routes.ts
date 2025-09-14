import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertFarmSchema, 
  insertUserQuestSchema,
  insertUserSchemeSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  app.get("/api/users/mobile/:mobile", async (req, res) => {
    const user = await storage.getUserByMobile(req.params.mobile);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  // Farm routes
  app.post("/api/farms", async (req, res) => {
    try {
      const farmData = insertFarmSchema.parse(req.body);
      const farm = await storage.createFarm(farmData);
      res.json(farm);
    } catch (error) {
      res.status(400).json({ error: "Invalid farm data" });
    }
  });

  app.get("/api/farms/user/:userId", async (req, res) => {
    const farm = await storage.getFarmByUserId(req.params.userId);
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }
    res.json(farm);
  });

  // Quest routes
  app.get("/api/quests", async (req, res) => {
    const { category } = req.query;
    let quests;
    
    if (category && typeof category === 'string') {
      quests = await storage.getQuestsByCategory(category);
    } else {
      quests = await storage.getAllQuests();
    }
    
    res.json(quests);
  });

  // User Quest routes
  app.get("/api/user-quests/:userId", async (req, res) => {
    const userQuests = await storage.getUserQuests(req.params.userId);
    res.json(userQuests);
  });

  app.post("/api/user-quests", async (req, res) => {
    try {
      const userQuestData = insertUserQuestSchema.parse(req.body);
      const userQuest = await storage.createUserQuest(userQuestData);
      res.json(userQuest);
    } catch (error) {
      res.status(400).json({ error: "Invalid user quest data" });
    }
  });

  app.patch("/api/user-quests/:id", async (req, res) => {
    const userQuest = await storage.updateUserQuest(req.params.id, req.body);
    if (!userQuest) {
      return res.status(404).json({ error: "User quest not found" });
    }
    res.json(userQuest);
  });

  // Complete quest endpoint
  app.post("/api/user-quests/:id/complete", async (req, res) => {
    const userQuest = await storage.updateUserQuest(req.params.id, {
      status: "completed",
      completedAt: new Date()
    });
    
    if (!userQuest) {
      return res.status(404).json({ error: "User quest not found" });
    }

    // Update user progress
    const progress = await storage.getUserProgress(userQuest.userId);
    if (progress) {
      const quest = await storage.getAllQuests();
      const questData = quest.find(q => q.id === userQuest.questId);
      
      if (questData) {
        await storage.updateUserProgress(userQuest.userId, {
          totalXp: progress.totalXp + questData.xpReward,
          totalCoins: progress.totalCoins + questData.coinReward,
          completedQuests: progress.completedQuests + 1,
          sustainabilityScore: progress.sustainabilityScore + Math.floor(questData.xpReward / 2),
          badges: questData.badgeReward ? [...progress.badges, questData.badgeReward] : progress.badges
        });
      }
    }

    res.json(userQuest);
  });

  // User Progress routes
  app.get("/api/user-progress/:userId", async (req, res) => {
    const progress = await storage.getUserProgress(req.params.userId);
    if (!progress) {
      return res.status(404).json({ error: "User progress not found" });
    }
    res.json(progress);
  });

  // Scheme routes
  app.get("/api/schemes", async (req, res) => {
    const { category } = req.query;
    let schemes;
    
    if (category && typeof category === 'string') {
      schemes = await storage.getSchemesByCategory(category);
    } else {
      schemes = await storage.getAllSchemes();
    }
    
    res.json(schemes);
  });

  // User Scheme routes
  app.get("/api/user-schemes/:userId", async (req, res) => {
    const userSchemes = await storage.getUserSchemes(req.params.userId);
    res.json(userSchemes);
  });

  app.post("/api/user-schemes", async (req, res) => {
    try {
      const userSchemeData = insertUserSchemeSchema.parse(req.body);
      const userScheme = await storage.createUserScheme(userSchemeData);
      res.json(userScheme);
    } catch (error) {
      res.status(400).json({ error: "Invalid user scheme data" });
    }
  });

  // Market routes
  app.get("/api/market-prices", async (req, res) => {
    const { district, crop } = req.query;
    let prices;
    
    if (crop && typeof crop === 'string') {
      prices = await storage.getLatestPricesByCrop(crop);
    } else {
      prices = await storage.getMarketPrices(district as string);
    }
    
    res.json(prices);
  });

  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    const { gramPanchayat, district } = req.query;
    const leaderboard = await storage.getLeaderboard(
      gramPanchayat as string, 
      district as string
    );
    res.json(leaderboard);
  });

  const httpServer = createServer(app);
  return httpServer;
}
