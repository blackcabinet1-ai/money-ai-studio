const users: any[] = []
const approvalRequests: any[] = []
const projects: any[] = []
const geminiKeys: any[] = []
const scenes: any[] = []

export const prisma = {
  user: {
    findUnique: async ({ where }: any) => users.find(u => u.email === where.email || u.id === where.id) || null,
    findFirst: async ({ where }: any) => users.find(u => (!where.email || u.email === where.email) && (!where.id || u.id === where.id) && (!where.inviteCode || u.inviteCode === where.inviteCode)) || null,
    findMany: async (_args?: any) => users,
    create: async ({ data }: any) => { const u = { id: Math.random().toString(), ...data }; users.push(u); return u },
    update: async ({ where, data }: any) => { const i = users.findIndex(u => u.email === where.email || u.id === where.id); if(i>=0) users[i] = {...users[i],...data}; return users[i] },
    delete: async ({ where }: any) => { const i = users.findIndex(u => u.id === where.id); if(i>=0) return users.splice(i,1)[0]; return null },
  },
  approvalRequest: {
    findUnique: async ({ where }: any) => approvalRequests.find(r => r.email === where.email || r.id === where.id) || null,
    findFirst: async ({ where }: any) => approvalRequests.find(r => (!where.email || r.email === where.email) && (!where.id || r.id === where.id)) || null,
    findMany: async (_args?: any) => approvalRequests,
    create: async ({ data }: any) => { const r = { id: Math.random().toString(), ...data }; approvalRequests.push(r); return r },
    update: async ({ where, data }: any) => { const i = approvalRequests.findIndex(r => r.email === where.email || r.id === where.id); if(i>=0) approvalRequests[i] = {...approvalRequests[i],...data}; return approvalRequests[i] },
    delete: async ({ where }: any) => { const i = approvalRequests.findIndex(r => r.email === where.email || r.id === where.id); if(i>=0) return approvalRequests.splice(i,1)[0]; return null },
  },
  project: {
    findUnique: async ({ where, include }: any) => { const p = projects.find(pr => pr.id === where.id); if(p && include?.scenes) return {...p, scenes: scenes.filter(s => s.projectId === p.id)}; return p || null },
    findFirst: async ({ where }: any) => projects.find(p => (!where.id || p.id === where.id) && (!where.userId || p.userId === where.userId)) || null,
    findMany: async (args?: any) => args?.where?.userId ? projects.filter(p => p.userId === args.where.userId) : projects,
    create: async ({ data }: any) => { const p = { id: Math.random().toString(), createdAt: new Date(), ...data }; projects.push(p); return p },
    update: async ({ where, data }: any) => { const i = projects.findIndex(p => p.id === where.id); if(i>=0) projects[i] = {...projects[i],...data}; return projects[i] },
    delete: async ({ where }: any) => { const i = projects.findIndex(p => p.id === where.id); if(i>=0) return projects.splice(i,1)[0]; return null },
  },
  geminiKey: {
    findUnique: async ({ where }: any) => geminiKeys.find(k => k.id === where.id) || null,
    findFirst: async (_args?: any) => geminiKeys.find(k => k.isActive !== false) || geminiKeys[0] || null,
    findMany: async (_args?: any) => geminiKeys,
    create: async ({ data }: any) => { const k = { id: Math.random().toString(), usageCount: 0, isActive: true, ...data }; geminiKeys.push(k); return k },
    update: async ({ where, data }: any) => { const i = geminiKeys.findIndex(k => k.id === where.id); if(i>=0) geminiKeys[i] = {...geminiKeys[i],...data}; return geminiKeys[i] },
    delete: async ({ where }: any) => { const i = geminiKeys.findIndex(k => k.id === where.id); if(i>=0) return geminiKeys.splice(i,1)[0]; return null },
  },
  scene: {
    findUnique: async ({ where }: any) => scenes.find(s => s.id === where.id) || null,
    findFirst: async ({ where }: any) => scenes.find(s => (!where.id || s.id === where.id) && (!where.projectId || s.projectId === where.projectId)) || null,
    findMany: async (args?: any) => { let result = args?.where?.projectId ? scenes.filter(s => s.projectId === args.where.projectId) : scenes; if(args?.orderBy?.order) result.sort((a,b) => a.order - b.order); return result },
    create: async ({ data }: any) => { const s = { id: Math.random().toString(), ...data }; scenes.push(s); return s },
    createMany: async ({ data }: any) => { data.forEach((d:any) => scenes.push({ id: Math.random().toString(), ...d })); return { count: data.length } },
    update: async ({ where, data }: any) => { const i = scenes.findIndex(s => s.id === where.id); if(i>=0) scenes[i] = {...scenes[i],...data}; return scenes[i] },
    deleteMany: async ({ where }: any) => { const count = scenes.filter(s => s.projectId === where.projectId).length; scenes.splice(0, scenes.length, ...scenes.filter(s => s.projectId !== where.projectId)); return { count } },
  },
}
