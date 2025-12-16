// 임시 메모리 데이터베이스 (Vercel용)
const users: any[] = []

export const prisma = {
  user: {
    findUnique: async ({ where }: any) => {
      return users.find(u => u.email === where.email) || null
    },
    create: async ({ data }: any) => {
      const user = { id: Math.random().toString(), ...data, createdAt: new Date() }
      users.push(user)
      return user
    },
    update: async ({ where, data }: any) => {
      const index = users.findIndex(u => u.email === where.email)
      if (index >= 0) {
        users[index] = { ...users[index], ...data }
        return users[index]
      }
      return null
    },
  },
}
