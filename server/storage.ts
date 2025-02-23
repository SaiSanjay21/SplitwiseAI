import { User, Group, GroupMember, Bill, InsertUser, Group as SelectGroup } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Group operations
  createGroup(name: string, userId: number): Promise<Group>;
  getGroup(id: number): Promise<Group | undefined>;
  getGroupsForUser(userId: number): Promise<Group[]>;
  
  // Group member operations
  addGroupMember(groupId: number, userId: number, symbol: string): Promise<GroupMember>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  
  // Bill operations
  createBill(bill: Bill): Promise<Bill>;
  getBillsForGroup(groupId: number): Promise<Bill[]>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private groups: Map<number, Group>;
  private groupMembers: Map<number, GroupMember[]>;
  private bills: Map<number, Bill[]>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.groups = new Map();
    this.groupMembers = new Map();
    this.bills = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createGroup(name: string, userId: number): Promise<Group> {
    const id = this.currentId++;
    const group: Group = { id, name, createdBy: userId };
    this.groups.set(id, group);
    return group;
  }

  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async getGroupsForUser(userId: number): Promise<Group[]> {
    const userGroups: Group[] = [];
    for (const [groupId, members] of this.groupMembers.entries()) {
      if (members.some(m => m.userId === userId)) {
        const group = this.groups.get(groupId);
        if (group) userGroups.push(group);
      }
    }
    return userGroups;
  }

  async addGroupMember(groupId: number, userId: number, symbol: string): Promise<GroupMember> {
    const id = this.currentId++;
    const member: GroupMember = { id, groupId, userId, symbol };
    
    if (!this.groupMembers.has(groupId)) {
      this.groupMembers.set(groupId, []);
    }
    this.groupMembers.get(groupId)!.push(member);
    
    return member;
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return this.groupMembers.get(groupId) || [];
  }

  async createBill(bill: Bill): Promise<Bill> {
    if (!this.bills.has(bill.groupId)) {
      this.bills.set(bill.groupId, []);
    }
    this.bills.get(bill.groupId)!.push(bill);
    return bill;
  }

  async getBillsForGroup(groupId: number): Promise<Bill[]> {
    return this.bills.get(groupId) || [];
  }
}

export const storage = new MemStorage();
