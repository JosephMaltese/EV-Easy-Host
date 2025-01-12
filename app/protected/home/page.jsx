"use client";
import React, { useEffect, useState } from "react";
import Map from "../../../components/ui/googlemaps";
import { createClient } from "@/utils/supabase/client";

function Page() {
  const [position, setPosition] = useState({ latitude: 0, longitude: 0 });
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for "Create New Station" form
  const [newStation, setNewStation] = useState({
    name: "",
    max_capacity: 0,
    cost_rate: 0,
    current_users: 0,
    latitude: 0,
    longitude: 0,
    carbon_saved: 0,   // or "0.0", up to you
    discount: 0
  });

  // Logged-in user data

  // ----------------------------------------
  // 1. Retrieve current user & their stations
  // ----------------------------------------
  const getOwnedStations = async () => {
    try {
      const client = createClient();
      const { data, error } = await client.auth.getUser();
      if (error || !data?.user) {
        console.error("No user found:", error);
        return;
      }
      // "owner" could be the user’s ID, or some name property, depending on how you handle it
      const userId = data.user.id;

      // Example: Maybe you call an endpoint to get the "owner name" from DB
      // Or if you store the owner name in user metadata, you'd fetch that.
      // We'll assume we have a function or endpoint that returns "ownerName" by userId:
      const resp = await fetch("/api/getHost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { user_id: userId } }),
      });
      const hostData = await resp.json();
      console.log("Host data:", hostData);
      
      if (!hostData || !hostData.data.name) {
        console.error("No owner name found for user");
        return;
      }
      // console.log(hostData.data.name);
      // Now fetch the stations for that owner
      const stationResp = await fetch("/api/hostNetwork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { owner: hostData.data.name } }),
      });
      const userStations = await stationResp.json();
      console.log("User stations:", userStations);
      if (userStations) {
        setStations(userStations);
      }
    } catch (err) {
      console.error("Error in getOwnedStations:", err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // 2. Create a new station
  // ----------------------------------------
  const handleCreateStation = async (e) => {
    e.preventDefault();
const client = createClient();
      const { data, error } = await client.auth.getUser();
      if (error || !data?.user) {
        console.error("No user found:", error);
        return;
      }
      // "owner" could be the user’s ID, or some name property, depending on how you handle it
      const userId = data.user.id;

      // Example: Maybe you call an endpoint to get the "owner name" from DB
      // Or if you store the owner name in user metadata, you'd fetch that.
      // We'll assume we have a function or endpoint that returns "ownerName" by userId:
      const resp = await fetch("/api/getHost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { user_id: userId } }),
      });
      const hostData = await resp.json();
      console.log("Host data:", hostData);
      
      if (!hostData || !hostData.data.name) {
        console.error("No owner name found for user");
        return;
      }




    
    // Make sure we have an owner from state
    if (!hostData.data.name) {
      console.error("Cannot create a station: no owner found.");
      return;
    }
    try {
      console.log("Creating station:", newStation);
      
      const res = await fetch("/api/stationNetwork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            owner : hostData.data.name,
            name: newStation.name,
            max_capacity: Number(newStation.max_capacity),
            cost_rate: Number(newStation.cost_rate),
            current_users: Number(newStation.current_users),
            latitude: newStation.latitude,
            longitude: newStation.longitude,
            carbon_saved: newStation.carbon_saved,
            discount: Number(newStation.discount),
          },
        }),
      });
      const created = await res.json();
      if (!res.ok) {
        console.error("Error creating station:", created.error);
        return;
      }
      console.log("Station created:", created);

      // Clear form
      setNewStation({
        name: "",
        max_capacity: 0,
        cost_rate: 0,
        current_users: 0,
        latitude: 0,
        longitude: 0,
        carbon_saved: 0,
        discount: 0
      });

      // Re-fetch stations to update UI
      getOwnedStations();
    } catch (err) {
      console.error("Error creating station:", err);
    }
  };

  // ----------------------------------------
  // Geolocation watchers (optional)
  // ----------------------------------------
  let watchId;
  function success(position) {
    const coords = position.coords;
    const latitude = coords.latitude;
    const longitude = coords.longitude;
    console.log("Latitude:", latitude, "Longitude:", longitude);
    setPosition({ latitude: latitude, longitude: longitude });
    console.log("Current Position:", coords);
  }

  function error(e) {
    console.log(e);
  }

  const options = {
    enableHighAccuracy: false,
    timeout: 30000,
    maximumAge: 0,
  };

  function startWatchingLocation() {
    watchId = navigator.geolocation.watchPosition(success, error, options);
  }

  function stopWatchingLocation() {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }
  // ----------------------------------------
  // Effects
  // ----------------------------------------
  useEffect(() => {
    startWatchingLocation();
    getOwnedStations(); // Fetch stations as soon as we know the user
    return () => {
      stopWatchingLocation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------
  // Render
  // ----------------------------------------
  return (
    <div className="h-screen">
      <h1 className="text-4xl font-bold text-center mb-6">Dashboard</h1>

      {/* Station Table */}
      <div className="p-4">
        <h2 className="text-2xl mb-2">Your Stations</h2>
        {loading && <p>Loading stations...</p>}
        {!loading && stations?.length === 0 && <p>No stations found.</p>}
        {!loading && stations?.length > 0 && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Name</th>
                <th className="border p-2">Max Capacity</th>
                <th className="border p-2">Cost Rate</th>
                <th className="border p-2">Current Users</th>
                <th className="border p-2">Latitude</th>
                <th className="border p-2">Longitude</th>
                <th className="border p-2">Discount</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{station.name}</td>
                  <td className="border p-2">{station.max_capacity}</td>
                  <td className="border p-2">{station.cost_rate}</td>
                  <td className="border p-2">{station.current_users}</td>
                  <td className="border p-2">{station.latitude}</td>
                  <td className="border p-2">{station.longitude}</td>
                  <td className="border p-2">{station.discount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Station Form */}
      <div className="p-4 mt-6">
        <h2 className="text-2xl mb-2">Create a New Station</h2>
        <form className="space-y-2 max-w-md" onSubmit={handleCreateStation}>
          <div>
            <label className="block font-semibold">Name:</label>
            <input
              type="text"
              className="border p-1 w-full"
              value={newStation.name}
              onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block font-semibold">Max Capacity:</label>
            <input
              type="number"
              className="border p-1 w-full"
              value={newStation.max_capacity}
              onChange={(e) =>
                setNewStation({ ...newStation, max_capacity: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block font-semibold">Cost Rate:</label>
            <input
              type="number"
              className="border p-1 w-full"
              value={newStation.cost_rate}
              onChange={(e) =>
                setNewStation({ ...newStation, cost_rate: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block font-semibold">Current Users:</label>
            <input
              type="number"
              className="border p-1 w-full"
              value={newStation.current_users}
              onChange={(e) =>
                setNewStation({ ...newStation, current_users: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block font-semibold">Latitude:</label>
            <input
              type="text"
              className="border p-1 w-full"
              value={newStation.latitude}
              onChange={(e) =>
                setNewStation({ ...newStation, latitude: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block font-semibold">Longitude:</label>
            <input
              type="text"
              className="border p-1 w-full"
              value={newStation.longitude}
              onChange={(e) =>
                setNewStation({ ...newStation, longitude: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block font-semibold">Discount:</label>
            <input
              type="number"
              className="border p-1 w-full"
              value={newStation.discount}
              onChange={(e) =>
                setNewStation({ ...newStation, discount: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
          >
            Add Station
          </button>
        </form>
      </div>

      <div className="mt-6">
        <Map stations={stations} />
      </div>
    </div>
  );
}

export default Page;
