import { 
  type User, type InsertUser,
  type Farm, type InsertFarm,
  type Quest, type InsertQuest,
  type UserQuest, type InsertUserQuest,
  type UserProgress, type InsertUserProgress,
  type Scheme, type InsertScheme,
  type UserScheme, type InsertUserScheme,
  type MarketPrice, type InsertMarketPrice
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByMobile(mobileNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Farms
  getFarmByUserId(userId: string): Promise<Farm | undefined>;
  createFarm(farm: InsertFarm): Promise<Farm>;
  updateFarm(id: string, updates: Partial<Farm>): Promise<Farm | undefined>;

  // Quests
  getAllQuests(): Promise<Quest[]>;
  getQuestsByCategory(category: string): Promise<Quest[]>;
  createQuest(quest: InsertQuest): Promise<Quest>;

  // User Quests
  getUserQuests(userId: string): Promise<UserQuest[]>;
  getUserQuest(userId: string, questId: string): Promise<UserQuest | undefined>;
  createUserQuest(userQuest: InsertUserQuest): Promise<UserQuest>;
  updateUserQuest(id: string, updates: Partial<UserQuest>): Promise<UserQuest | undefined>;

  // User Progress
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: string, updates: Partial<UserProgress>): Promise<UserProgress | undefined>;

  // Schemes
  getAllSchemes(): Promise<Scheme[]>;
  getSchemesByCategory(category: string): Promise<Scheme[]>;
  
  // User Schemes
  getUserSchemes(userId: string): Promise<UserScheme[]>;
  createUserScheme(userScheme: InsertUserScheme): Promise<UserScheme>;
  updateUserScheme(id: string, updates: Partial<UserScheme>): Promise<UserScheme | undefined>;

  // Market Prices
  getMarketPrices(district?: string): Promise<MarketPrice[]>;
  getLatestPricesByCrop(crop: string): Promise<MarketPrice[]>;
  createMarketPrice(price: InsertMarketPrice): Promise<MarketPrice>;

  // Leaderboard
  getLeaderboard(gramPanchayat?: string, district?: string): Promise<Array<{user: User, progress: UserProgress}>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private farms: Map<string, Farm> = new Map();
  private quests: Map<string, Quest> = new Map();
  private userQuests: Map<string, UserQuest> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private schemes: Map<string, Scheme> = new Map();
  private userSchemes: Map<string, UserScheme> = new Map();
  private marketPrices: Map<string, MarketPrice> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default quests
    const defaultQuests: InsertQuest[] = [
      {
        title: "Prepare Jeevamrutha",
        description: "Create organic liquid fertilizer using cow dung, cow urine, jaggery, and gram flour.",
        category: "Soil Health",
        difficulty: "medium",
        coinReward: 150,
        xpReward: 10,
        badgeReward: "Compost Master",
        steps: [
          "Watch preparation video",
          "Gather ingredients (cow dung, cow urine, jaggery, gram flour)",
          "Mix and ferment for 7 days",
          "Upload completion photo"
        ],
        isActive: true
      },
      {
        title: "Install Drip Irrigation",
        description: "Set up efficient drip irrigation system for water conservation in vegetable crops.",
        category: "Water Management",
        difficulty: "high",
        coinReward: 200,
        xpReward: 15,
        badgeReward: "Water Saver",
        steps: [
          "Plan irrigation layout",
          "Purchase drip irrigation kit",
          "Install main pipeline",
          "Connect drippers to plants",
          "Test system and upload photo"
        ],
        isActive: true
      },
      {
        title: "Plant Marigold Border",
        description: "Plant marigold flowers around crop fields for natural pest control.",
        category: "Pest Control",
        difficulty: "easy",
        coinReward: 100,
        xpReward: 8,
        steps: [
          "Purchase marigold seeds",
          "Prepare border areas",
          "Sow seeds around field perimeter",
          "Water and maintain for 2 weeks",
          "Upload growth photo"
        ],
        isActive: true
      }
    ];

    defaultQuests.forEach(quest => {
      const id = randomUUID();
      this.quests.set(id, { 
        ...quest, 
        id, 
        createdAt: new Date(),
        badgeReward: quest.badgeReward || null,
        isActive: quest.isActive ?? true
      });
    });

    // Initialize default schemes
    const defaultSchemes: InsertScheme[] = [
      {
        name: "PM-KISAN Scheme",
        description: "Direct Income Support to small and marginal farmers",
        category: "Income Support",
        eligibilityCriteria: [
          "Small and marginal farmer families",
          "Land ownership records",
          "Valid Aadhaar card",
          "Bank account"
        ],
        benefits: "₹6,000 per year in three installments of ₹2,000 each",
        applicationSteps: [
          "Aadhaar verification",
          "Bank account linking",
          "Land ownership document upload",
          "Visit Patwari for verification",
          "Submit final application"
        ],
        documentsRequired: [
          "Aadhaar Card",
          "Bank Account Details",
          "Land Ownership Documents",
          "Mobile Number"
        ],
        isActive: true
      },
      {
        name: "Drip Irrigation Subsidy",
        description: "Water conservation subsidy for efficient irrigation systems",
        category: "Water Conservation",
        eligibilityCriteria: [
          "Farmers with water source",
          "Minimum 0.5 acre land",
          "No previous subsidy for irrigation"
        ],
        benefits: "Up to 55% subsidy on drip irrigation system installation",
        applicationSteps: [
          "Technical assessment",
          "Quotation submission",
          "Approval and installation",
          "Verification and payment"
        ],
        documentsRequired: [
          "Land Documents",
          "Water Source Certificate",
          "Technical Quotation",
          "Bank Details"
        ],
        isActive: true
      }
    ];

    defaultSchemes.forEach(scheme => {
      const id = randomUUID();
      this.schemes.set(id, { ...scheme, id, isActive: scheme.isActive ?? true });
    });

    // Initialize sample market prices
    const samplePrices: InsertMarketPrice[] = [
      {
        crop: "Wheat",
        variety: "Premium",
        price: 2350,
        unit: "quintal",
        mandi: "Wardha Mandi",
        district: "Wardha",
        state: "Maharashtra",
        date: new Date(),
        trend: "up"
      },
      {
        crop: "Maize",
        variety: "Standard",
        price: 1890,
        unit: "quintal",
        mandi: "Wardha Mandi",
        district: "Wardha",
        state: "Maharashtra",
        date: new Date(),
        trend: "down"
      },
      {
        crop: "Cotton",
        variety: "Medium Staple",
        price: 5890,
        unit: "quintal",
        mandi: "Wardha Mandi",
        district: "Wardha",
        state: "Maharashtra",
        date: new Date(),
        trend: "stable"
      }
    ];

    samplePrices.forEach(price => {
      const id = randomUUID();
      this.marketPrices.set(id, { 
        ...price, 
        id,
        variety: price.variety || null,
        unit: price.unit || "quintal",
        trend: price.trend || null
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByMobile(mobileNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.mobileNumber === mobileNumber);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date(), language: insertUser.language || 'hi' };
    this.users.set(id, user);
    
    // Create default user progress
    await this.createUserProgress({
      userId: id,
      level: 1,
      totalXp: 0,
      totalCoins: 0,
      sustainabilityScore: 0,
      badges: [],
      completedQuests: 0
    });

    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Farm methods
  async getFarmByUserId(userId: string): Promise<Farm | undefined> {
    return Array.from(this.farms.values()).find(farm => farm.userId === userId);
  }

  async createFarm(insertFarm: InsertFarm): Promise<Farm> {
    const id = randomUUID();
    const farm: Farm = { 
      ...insertFarm, 
      id, 
      createdAt: new Date(),
      primaryCrops: insertFarm.primaryCrops as string[]
    };
    this.farms.set(id, farm);
    return farm;
  }

  async updateFarm(id: string, updates: Partial<Farm>): Promise<Farm | undefined> {
    const farm = this.farms.get(id);
    if (!farm) return undefined;
    
    const updatedFarm = { ...farm, ...updates };
    this.farms.set(id, updatedFarm);
    return updatedFarm;
  }

  // Quest methods
  async getAllQuests(): Promise<Quest[]> {
    return Array.from(this.quests.values()).filter(quest => quest.isActive);
  }

  async getQuestsByCategory(category: string): Promise<Quest[]> {
    return Array.from(this.quests.values()).filter(
      quest => quest.isActive && quest.category === category
    );
  }

  async createQuest(insertQuest: InsertQuest): Promise<Quest> {
    const id = randomUUID();
    const quest: Quest = { 
      ...insertQuest, 
      id, 
      createdAt: new Date(),
      badgeReward: insertQuest.badgeReward || null,
      isActive: insertQuest.isActive ?? true
    };
    this.quests.set(id, quest);
    return quest;
  }

  // User Quest methods
  async getUserQuests(userId: string): Promise<UserQuest[]> {
    return Array.from(this.userQuests.values()).filter(uq => uq.userId === userId);
  }

  async getUserQuest(userId: string, questId: string): Promise<UserQuest | undefined> {
    return Array.from(this.userQuests.values()).find(
      uq => uq.userId === userId && uq.questId === questId
    );
  }

  async createUserQuest(insertUserQuest: InsertUserQuest): Promise<UserQuest> {
    const id = randomUUID();
    const userQuest: UserQuest = { 
      ...insertUserQuest, 
      id, 
      createdAt: new Date(),
      progress: (insertUserQuest.progress || []) as boolean[],
      completedAt: insertUserQuest.completedAt || null,
      status: insertUserQuest.status || 'not_started'
    };
    this.userQuests.set(id, userQuest);
    return userQuest;
  }

  async updateUserQuest(id: string, updates: Partial<UserQuest>): Promise<UserQuest | undefined> {
    const userQuest = this.userQuests.get(id);
    if (!userQuest) return undefined;
    
    const updatedUserQuest = { ...userQuest, ...updates };
    this.userQuests.set(id, updatedUserQuest);
    return updatedUserQuest;
  }

  // User Progress methods
  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(up => up.userId === userId);
  }

  async createUserProgress(insertUserProgress: InsertUserProgress): Promise<UserProgress> {
    const id = randomUUID();
    const progress: UserProgress = { 
      ...insertUserProgress,
      id,
      level: insertUserProgress.level ?? 1,
      totalXp: insertUserProgress.totalXp ?? 0,
      totalCoins: insertUserProgress.totalCoins ?? 0,
      sustainabilityScore: insertUserProgress.sustainabilityScore ?? 0,
      badges: (insertUserProgress.badges || []) as string[],
      completedQuests: insertUserProgress.completedQuests ?? 0
    };
    this.userProgress.set(id, progress);
    return progress;
  }

  async updateUserProgress(userId: string, updates: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const progress = Array.from(this.userProgress.values()).find(up => up.userId === userId);
    if (!progress) return undefined;
    
    const updatedProgress = { ...progress, ...updates };
    this.userProgress.set(progress.id, updatedProgress);
    return updatedProgress;
  }

  // Scheme methods
  async getAllSchemes(): Promise<Scheme[]> {
    return Array.from(this.schemes.values()).filter(scheme => scheme.isActive);
  }

  async getSchemesByCategory(category: string): Promise<Scheme[]> {
    return Array.from(this.schemes.values()).filter(
      scheme => scheme.isActive && scheme.category === category
    );
  }

  // User Scheme methods
  async getUserSchemes(userId: string): Promise<UserScheme[]> {
    return Array.from(this.userSchemes.values()).filter(us => us.userId === userId);
  }

  async createUserScheme(insertUserScheme: InsertUserScheme): Promise<UserScheme> {
    const id = randomUUID();
    const userScheme: UserScheme = { 
      ...insertUserScheme, 
      id,
      status: insertUserScheme.status || 'not_started',
      applicationData: insertUserScheme.applicationData || {},
      appliedAt: insertUserScheme.appliedAt || null,
      approvedAt: insertUserScheme.approvedAt || null
    };
    this.userSchemes.set(id, userScheme);
    return userScheme;
  }

  async updateUserScheme(id: string, updates: Partial<UserScheme>): Promise<UserScheme | undefined> {
    const userScheme = this.userSchemes.get(id);
    if (!userScheme) return undefined;
    
    const updatedUserScheme = { ...userScheme, ...updates };
    this.userSchemes.set(id, updatedUserScheme);
    return updatedUserScheme;
  }

  // Market Price methods
  async getMarketPrices(district?: string): Promise<MarketPrice[]> {
    const prices = Array.from(this.marketPrices.values());
    if (district) {
      return prices.filter(price => price.district === district);
    }
    return prices;
  }

  async getLatestPricesByCrop(crop: string): Promise<MarketPrice[]> {
    return Array.from(this.marketPrices.values())
      .filter(price => price.crop === crop)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async createMarketPrice(insertMarketPrice: InsertMarketPrice): Promise<MarketPrice> {
    const id = randomUUID();
    const marketPrice: MarketPrice = { 
      ...insertMarketPrice, 
      id,
      variety: insertMarketPrice.variety || null,
      unit: insertMarketPrice.unit || "quintal", 
      trend: insertMarketPrice.trend || null
    };
    this.marketPrices.set(id, marketPrice);
    return marketPrice;
  }

  // Leaderboard methods
  async getLeaderboard(gramPanchayat?: string, district?: string): Promise<Array<{user: User, progress: UserProgress}>> {
    const results: Array<{user: User, progress: UserProgress}> = [];
    
    for (const user of Array.from(this.users.values())) {
      const progress = await this.getUserProgress(user.id);
      if (progress) {
        if (gramPanchayat || district) {
          const farm = await this.getFarmByUserId(user.id);
          if (farm && 
              (!gramPanchayat || farm.gramPanchayat === gramPanchayat) &&
              (!district || farm.district === district)) {
            results.push({ user, progress });
          }
        } else {
          results.push({ user, progress });
        }
      }
    }
    
    return results.sort((a, b) => b.progress.sustainabilityScore - a.progress.sustainabilityScore);
  }
}

export const storage = new MemStorage();
