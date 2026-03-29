// ============ USE PLAN HOOK ============
import { useAuth } from '../context/AuthContext'
import { canAccess, PLANS, FEATURES, PLAN_INFO } from '../services/tiers'

// Admin emails get full access
const ADMIN_EMAILS = [
  'sales@getagenter.com',
  'daouda15@hotmail.com',
  'bassabdoul7@gmail.com',
]

export function usePlan() {
  const { user, profile } = useAuth()
  
  const userPlan = profile?.plan || PLANS.FREE
  
  // Check if admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
  
  // Admins get full access
  if (isAdmin) {
    return {
      plan: 'admin',
      planInfo: { name: 'Admin', price: 0 },
      canAccessAITutor: true,
      canAccessLab: true,
      canAccessScholarships: true,
      canAccessExamPrep: true,
      canAccessTeacherDashboard: true,
      isStudent: false,
      isSchool: false,
      isTeacher: false,
      isFree: false,
      isPaid: true,
      isAdmin: true,
    }
  }
  
  return {
    plan: userPlan,
    planInfo: PLAN_INFO[userPlan],
    
    // Feature checks
    canAccessAITutor: canAccess(userPlan, FEATURES.AI_TUTOR),
    canAccessLab: canAccess(userPlan, FEATURES.VIRTUAL_LAB),
    canAccessScholarships: canAccess(userPlan, FEATURES.SCHOLARSHIPS),
    canAccessExamPrep: canAccess(userPlan, FEATURES.EXAM_PREP),
    canAccessTeacherDashboard: canAccess(userPlan, FEATURES.TEACHER_DASHBOARD),
    
    // Helpers
    isStudent: userPlan === PLANS.STUDENT,
    isSchool: userPlan === PLANS.SCHOOL,
    isTeacher: userPlan === PLANS.TEACHER,
    isFree: userPlan === PLANS.FREE,
    isPaid: userPlan !== PLANS.FREE,
    isAdmin: false,
  }
}
