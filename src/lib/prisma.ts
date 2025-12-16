const users: any[] = []
const approvalRequests: any[] = []
const projects: any[] = []
const geminiKeys: any[] = []
const scenes: any[] = []

export const prisma = {
  user: {
    findUnique: async ({ where }: any) => users.find(u => u.email === where.email || u.id === where.id) || null,
    findMany: async () => users,
    create: async ({ data }: any) => { const u = { id: Math.random().toString(), ...data }; users.push(u); return u },
    update: async ({ where, data }: any) => { const i = users.findIndex(u => u.email === where.email || u.id === where.id); if(i>=0) users[i] = {...users[i],...data}; return users[i] },
    delete: async ({ where }: any) => { const i = users.findIndex(u => u.id === where.id); if(i>=0) return users.splice(i,1)[0]; return null },
  },
  approvalRequest: {
    findUnique: async ({ where }: any) => approvalRequests.find(r => r.email === where.email || r.id === where.id) || null,
    findMany: async () => approvalRequests,
    create: async ({ data }: any) => { const r = { id: Math.random().toString(), ...data }; approvalRequests.push(r); return r },
    update: async ({ where, data }: any) => { const i = approvalRequests.findIndex(r => r.email === where.email || r.id === where.id); if(i>=0) approvalRequests[i] = {...approvalRequests[i],...data}; return approvalRequests[i] },
    delete: async ({ where }: any) => { const i = approvalRequests.findIndex(r => r.email === where.email || r.id === where.id); if(i>=0) return approvalRequests.splice(i,1)[0]; return null },
  },
  project: {
    findUnique: async ({ where }: any) => projects.find(p => p.id === where.id) || null,
    findMany: async ({ where }: any = {}) => where?.userId ? projects.filter(p => p.userId === where.userId) : projects,
    create: async ({ data }: any) => { const p = { id: Math.random().toString(), ...data }; projects.push(p); return p },
    update: async ({ where, data }: any) => { const i = projects.findIndex(p => p.id === where.id); if(i>=0) projects[i] = {...projects[i],...data}; return projects[i] },
    delete: async ({ where }: any) => { const i = projects.findIndex(p => p.id === where.id); if(i>=0) return projects.splice(i,1)[0]; return null },
  },
  geminiKey: {
    findFirst: async () => geminiKeys[0] || null,
    findMany: async () => geminiKeys,
    create: async ({ data }: any) => { const k = { id: Math.random().toString(), ...data }; geminiKeys.push(k); return k },
    update: async ({ where, data }: any) => { const i = geminiKeys.findIndex(k => k.id === where.id); if(i>=0) geminiKeys[i] = {...geminiKeys[i],...data}; return geminiKeys[i] },
    delete: async ({ where }: any) => { const i = geminiKeys.findIndex(k => k.id === where.id); if(i>=0) return geminiKeys.splice(i,1)[0]; return null },
  },
  scene: {
    findMany: async ({ where }: any = {}) => where?.projectId ? scenes.filter(s => s.projectId === where.projectId) : scenes,
    create: async ({ data }: any) => { const s = { id: Math.random().toString(), ...data }; scenes.push(s); return s },
    createMany: async ({ data }: any) => { data.forEach((d:any) => scenes.push({ id: Math.random().toString(), ...d })); return { count: data.length } },
    deleteMany: async ({ where }: any) => { const count = scenes.filter(s => s.projectId === where.projectId).length; scenes.splice(0, scenes.length, ...scenes.filter(s => s.projectId !== where.projectId)); return { count } },
    update: async ({ where, data }: any) => { const i = scenes.findIndex(s => s.id === where.id); if(i>=0) scenes[i] = {...scenes[i],...data}; return scenes[i] },
  },
}
