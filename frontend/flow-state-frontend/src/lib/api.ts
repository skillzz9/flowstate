const API_URL = "http://127.0.0.1:8000/api";

export async function getLoops() {
  const response = await fetch(`${API_URL}/loops/`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch loops. Is the Django server running?");
  }
  
  return response.json();
}