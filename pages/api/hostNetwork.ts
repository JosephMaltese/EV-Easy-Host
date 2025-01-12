import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.HOST_SUPABASE_URL!;
const supabaseKey = process.env.HOST_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);


export const getStationsFromOwner = async (owner : string) =>{
    try {
    let  {data : station_data, error: fetchError} =  await supabase.from('stations').select("*").eq("owner", owner);
    if (fetchError){
        console.log("Fetch error!")
    }    
    return station_data
    }
    catch(err){
        console.log(err)
        return null
    }
}

export const getAllStations = async () =>{
    try {
    let  {data : station_data, error: fetchError} =  await supabase.from('stations').select("*");
    if (fetchError){
        console.log("Fetch error!")
    }    
    return station_data
    }
    catch(err){
        console.log(err)
        return null
    }
}










import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const allStations = await getAllStations();
      res.status(200).json( allStations);
      break;
    case 'POST':
        const data = req.body;
        const stations = await getStationsFromOwner(data.data.owner);
        if (!stations){
            res.status(400).json({error: "No stations found"});
            return
        }
        res.status(200).json(stations);
        break;
  }
}
