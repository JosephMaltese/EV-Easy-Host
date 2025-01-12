import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.HOST_SUPABASE_URL!;
const supabaseKey = process.env.HOST_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);


export const checkHostExist = async (user_id: string) =>{
    try {
    let  {data : host_data, error: fetchError} =  await supabase.from('hosters').select("*").eq("auth_user_id", user_id).maybeSingle();
    if (fetchError){
        console.log("Fetch error!")
    }    
    return host_data
    }
    catch(err){
        console.log(err)
        return null
    }
}

export const checkStationExist = async (name: string, owner: string) =>{
    try {
    let  {data : station_data, error: fetchError} =  await supabase.from('stations').select("*").eq("name", name).eq("owner", owner).single();
    if (fetchError){
        console.log("Fetch error!")
        console.log(fetchError);
        
    }    
    return station_data
    }
    catch(err){
        console.log(err)
        return null
    }
}

export const addNewStation = async (name : string, max_capacity : number, cost_rate : number, current_users : number, latitude: string, longitude: string, carbon_saved : string,discount : number, owner : string ) =>{
    try {
    if (await checkStationExist(name, owner))
    {
        console.log("Station already exists")
        return null
    }
    let { data: newStation, error: insertError } = await supabase
      .from('stations')
      .insert([
        {
          name: name,
          owner: owner,
          max_capacity: max_capacity,
          cost_rate: cost_rate,
          current_users: current_users,
          longitude: longitude,
          latitude: latitude,
          carbon_saved: 0,
          reserved: 0,
          discount: discount,
        },
      ])
      .select('*').maybeSingle(); // Use `.select('*')` to return the inserted row
  
    if (insertError) {
      console.error('Error creating station:', insertError.message);
      return null;
    }
    return newStation
    } catch(err){
    console.log(err);
    return null
    }
}

export const modifyStation = async (

  curr_name: string, owner: string,
  updates: {
    name: string;
    max_capacity?: number;
    cost_rate?: number;
    current_users?: number;
    latitude?: string;
    longitude?: string;
    carbon_saved?: string;
    discount?: number;
  }
) => {
  if (checkStationExist(curr_name, owner) === null) {
    console.log("Station does not exist")
    return null
  }
  const { data, error } = await supabase
    .from('stations')
    .update(updates)
    .eq('name', curr_name).eq('owner', owner).select('*')
    .single();

  if (error) {
    console.error('Error modifying station:', error.message);
    return null;
  }

  return data;
};


import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
        const data = req.body;
        const name = data.data.name;
        const owner = data.data.owner;
        const max_capacity = data.data.max_capacity;
        const cost_rate = data.data.cost_rate;
        const current_users = data.data.current_users;
        const latitude = data.data.latitude;
        const longitude = data.data.longitude;
        const carbon_saved = data.data.carbon_saved;
        const discount = data.data.discount;
    
        const stations = await addNewStation(name, max_capacity, cost_rate, current_users, latitude, longitude, carbon_saved, discount, owner);
        if (!stations){
            res.status(400).json({error: "No stations found"});
            return
        }
        res.status(200).json(stations);
        break;
    
        case 'PATCH':
        const data2= req.body;
        const station = await modifyStation(data.data.curr_name, data.data.owner, data.data.updates);
        if (!station){
            res.status(400).json({error: "Error modifying station"});
            return
        }
  }
}