import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://byxrmavgpjmgxymmnipd.supabase.co'
const supabaseAnonKey = 'sb_publishable_KCSyseXsOlf2qtXr94BxaQ_JA3Kph8x'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})