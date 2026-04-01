import { useEffect, useRef, useState, useCallback } from "react";
import { openDB } from "idb";

const DB_NAME = "EduvantaTrackerDB";
const STORE_NAME = "history";
const DB_VERSION = 1;

// Helper to initialize IDB correctly 
const initDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    },
  });
};

export const usePageTracker = () => {
  const [data, setData] = useState({
    activeTime: 0,
    inactiveTime: 0,
    timestamp: Date.now()
  });

  const [totalActiveSeconds, setTotalActiveSeconds] = useState(0);
  const [totalInactiveSeconds, setTotalInactiveSeconds] = useState(0);

  // Use refs to continuously track precise milliseconds 
  const activeStartRef = useRef(Date.now());
  const inactiveStartRef = useRef(null);
  
  const activeAccumulatedRef = useRef(0);
  const inactiveAccumulatedRef = useRef(0);
  
  const isCurrentlyActiveRef = useRef(!document.hidden && document.hasFocus());
  const isReloadingRef = useRef(false);

  // Sync state data
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const updateAccumulators = useCallback(() => {
    const now = Date.now();
    if (isCurrentlyActiveRef.current) {
      if (activeStartRef.current) {
        activeAccumulatedRef.current += (now - activeStartRef.current);
      }
      activeStartRef.current = now; // reset active tick
    } else {
      if (inactiveStartRef.current) {
        inactiveAccumulatedRef.current += (now - inactiveStartRef.current);
      }
      inactiveStartRef.current = now; // reset inactive tick
    }

    const newData = {
      activeTime: activeAccumulatedRef.current,
      inactiveTime: inactiveAccumulatedRef.current,
      timestamp: now
    };
    
    setData(newData);
    return newData;
  }, []);

  const saveToIDB = useCallback(async (finalData) => {
    try {
      const db = await initDB();
      // append records tracking session history, do NOT overwrite
      await db.add(STORE_NAME, finalData);
    } catch (err) {
      console.error("Failed to save tracking data to IDB", err);
    }
  }, []);

  // 🔥 NEW: API Methods for Data Harvesting
  const getTrackingData = useCallback(async () => {
    try {
      const db = await initDB();
      return await db.getAll(STORE_NAME);
    } catch(err) {
      console.error(err);
      return [];
    }
  }, []);

  const downloadTrackingData = useCallback(async () => {
    // Dynamically retrieve stored histories specifically on button press avoiding continuous memory lag.
    const records = await getTrackingData();
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "EduvantaAz_track_History.json";
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [getTrackingData]);

  const clearTrackingData = useCallback(async () => {
    try {
      const db = await initDB();
      await db.clear(STORE_NAME);
    } catch(err) {
      console.error("Failed to clear tracking data from IDB", err);
    }
  }, []);

  // Handle Tab blur / visibility switches seamlessly
  const markInactive = useCallback(() => {
    if (!isCurrentlyActiveRef.current) return;
    const now = Date.now();
    activeAccumulatedRef.current += (now - activeStartRef.current);
    
    isCurrentlyActiveRef.current = false;
    inactiveStartRef.current = now;
    
    updateAccumulators();
  }, [updateAccumulators]);

  const markActive = useCallback(() => {
    if (isCurrentlyActiveRef.current) return;
    const now = Date.now();
    if (inactiveStartRef.current) {
      inactiveAccumulatedRef.current += (now - inactiveStartRef.current);
    }
    
    isCurrentlyActiveRef.current = true;
    activeStartRef.current = now;
    
    updateAccumulators();
  }, [updateAccumulators]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        markInactive();
      } else {
        markActive();
      }
    };

    window.addEventListener("blur", markInactive);
    window.addEventListener("focus", markActive);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("blur", markInactive);
      window.removeEventListener("focus", markActive);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [markInactive, markActive]);

  // Live Timer Update
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let liveActive = activeAccumulatedRef.current;
      let liveInactive = inactiveAccumulatedRef.current;

      if (isCurrentlyActiveRef.current) {
        liveActive += (now - activeStartRef.current);
      } else {
        liveInactive += (now - inactiveStartRef.current);
      }

      setTotalActiveSeconds(Math.floor(liveActive / 1000));
      setTotalInactiveSeconds(Math.floor(liveInactive / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  // Intercept intentional key commands representing a browser refresh natively
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Catch F5, Ctrl+R, or Cmd+R keystrokes correctly guessing typical human reloads
      if (e.key === "F5" || (e.ctrlKey && e.key.toLowerCase() === "r") || (e.metaKey && e.key.toLowerCase() === "r")) {
        isReloadingRef.current = true;
        
        // Reset trap automatically returning strictly to normal state avoiding infinite memory holes
        setTimeout(() => { isReloadingRef.current = false; }, 2000);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Unload Save behavior tracking
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Calculate final sub-second states
      const finalMetrics = updateAccumulators();
      // Silently save tracking payloads securely maintaining cumulative dataset preventing refresh drops
      saveToIDB(finalMetrics);

      // Systematically block intrusive 'Leave Page' Alerts strictly when trapped reloading manually
      if (!isReloadingRef.current) {
        const msg = "Are you sure you want to leave this page?";
        e.returnValue = msg;
        return msg;
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [updateAccumulators, saveToIDB]);

  return {
    data,
    totalActiveSeconds,
    totalInactiveSeconds,
    downloadTrackingData,
    getTrackingData,
    clearTrackingData
  };
};