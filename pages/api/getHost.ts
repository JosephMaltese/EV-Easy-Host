import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const getHost = async (user_id : string) => {
    // Query supabase to see if from the table users select all where auth_user_id is equal to the current user_id
    const user_data =  await supabase.from('hosters').select("*").eq("auth_user_id", user_id).maybeSingle();
    // console.log(user_data)
    if (!user_data.data){
      const { data: newUser, error: insertError } = await supabase
      .from('hosters')
      .insert([
        {
          auth_user_id: user_id,
          name: "", // Assuming names is an array field
        },
      ])
      .select('').maybeSingle(); // Use .select('*') to return the inserted row

    if (insertError) {
      console.error('Error creating user:', insertError.message);
      return insertError;
    }
    const data = await user_data.data.json()
    return data
    }
    else return user_data
}



import type { NextApiRequest, NextApiResponse } from 'next';
import { create } from 'domain';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      // console.log(req.body)
      const data = req.body;
      const user = await getHost(data.data.user_id);
      res.status(200).json( user);
      break;
  }
}
