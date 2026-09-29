import type { UserProfile } from '../types'

export function canAccessFase2(profile?: UserProfile | null): boolean {
  return profile?.fase1Aprovada === true
}
