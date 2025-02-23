import { IStorage } from "./types";
import { InsertUser, User, Group, GroupMember, Bill } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private groups: Map<number, Group>;
  private groupMembers: Map<number, GroupMember>;
  private bills: Map<number, Bill>;
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

  async getUserGroups(userId: number): Promise<Group[]> {
    const memberGroups = Array.from(this.groupMembers.values())
      .filter(member => member.userId === userId)
      .map(member => this.groups.get(member.groupId))
      .filter((group): group is Group => group !== undefined);

    const createdGroups = Array.from(this.groups.values())
      .filter(group => group.createdBy === userId);

    return [...new Set([...memberGroups, ...createdGroups])];
  }

  async addGroupMember(groupId: number, userId: number, symbol: string): Promise<GroupMember> {
    const id = this.currentId++;
    const member: GroupMember = { id, groupId, userId, symbol };
    this.groupMembers.set(id, member);
    return member;
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return Array.from(this.groupMembers.values())
      .filter(member => member.groupId === groupId);
  }

  async createBill(bill: Omit<Bill, "id">): Promise<Bill> {
    const id = this.currentId++;
    const newBill: Bill = { ...bill, id };
    this.bills.set(id, newBill);
    return newBill;
  }

  async getGroupBills(groupId: number): Promise<Bill[]> {
    return Array.from(this.bills.values())
      .filter(bill => bill.groupId === groupId);
  }
}

export const storage = new MemStorage();
