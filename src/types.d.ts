// Global, reusable types for the app

// -------- Domain enums/unions --------
export type LanguageStore = 'en' | 'es'
export type BrochureType = 'professional' | 'funny'

// -------- API: Users / Remaining --------
export interface GetBrochuresRemainingResponse {
  brochures_remaining: number
  anon_id: string
}
export type GetBrochuresRemainingResult =
  | { success: true; data: GetBrochuresRemainingResponse }
  | { success: false; error?: unknown }

// -------- API: Create brochure --------
export interface BrochureSubmitData {
  companyName: string
  url: string
  language: LanguageStore
  brochureType: BrochureType
}
export type BrochureSubmitResult =
  | { success: true }
  | { success: false; status?: number; error?: unknown }

// -------- API: Download PDF --------
export type DownloadResult =
  | { success: true; blob: Blob; filename: string }
  | { success: false; status?: number; error?: unknown }