
export interface SharedUser {
  userId: number
  access: 'READ' | 'WRITE'
}

export function getAccountAccess(
  account: { 
    owner_user_id?: bigint | null, 
    visibility?: string | null, 
    visible_to_user_ids?: any 
  }, 
  userId: number
): 'OWNER' | 'WRITE' | 'READ' | 'NONE' {
  
  // 1. Owner Check
  if (account.owner_user_id && Number(account.owner_user_id) === userId) {
    return 'OWNER'
  }

  // 2. Family Visibility
  // Assuming 'FAMILY' implies WRITE for now (Joint Account behavior)
  if (account.visibility === 'FAMILY') {
    return 'WRITE'
  }

  // 3. Shared Specific Check
  const sharedList = account.visible_to_user_ids as SharedUser[]
  if (Array.isArray(sharedList)) {
    const userPerm = sharedList.find(u => Number(u.userId) === userId)
    if (userPerm) {
      return userPerm.access
    }
  }

  return 'NONE'
}

export function canWrite(access: 'OWNER' | 'WRITE' | 'READ' | 'NONE'): boolean {
  return access === 'OWNER' || access === 'WRITE'
}
