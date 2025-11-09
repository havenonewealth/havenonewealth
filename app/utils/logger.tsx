import { supabase } from '@/lib/supabaseClient'

export async function logError(source: string, error: any) {
  const message = error?.message || 'Unknown error'
  const stack = error?.stack || JSON.stringify(error)

  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('error_logs').insert({
      user_id: user?.id || null,
      source,
      message,
      stack_trace: stack
    })
  } catch (e) {
    console.error('Failed to log error:', e)
  }
}
