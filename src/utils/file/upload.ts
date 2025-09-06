const pinataPublicURL = "silver-passive-marten-530.mypinata.cloud";


export const uploadFile = async (file: File) => {
    const imgjson = await handleSetMetaData(file);
    console.log("imgjson", pinataPublicURL + imgjson)
    return pinataPublicURL + imgjson
}


export const handleSetMetaData = async (file: File | null) => {
    console.log("calling handleSetMetaData...")
    const data = new FormData();
    if (!file) return
    data.append("file", file);
    data.append("network", "public")
    const PINATA_PUBLIC_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiMGEyNDEzNy1lODcyLTQ0MGUtOGZmMy04YTgxMTgyYTU4NTUiLCJlbWFpbCI6ImluZm9Ac2hlcmV4LnZpcCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJlOWEzNDdlYzFhOTJkN2NhZjMzZSIsInNjb3BlZEtleVNlY3JldCI6ImZiNmUyZWI0YjAyNDA2MDQwNGEzMWMzYmUxMGIyYzM1MWJhNzE4MTM4YTc5MDZiMjMxZjA2YjhlNDI4MDYyZjAiLCJleHAiOjE3ODg3MTI2NTN9.Fh_djpC5Pi-L_tlqRc0nok3POMXTk96xd3ZZCjg1vBA`
  
  
    const request = await fetch(
      "https://uploads.pinata.cloud/v3/files",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_PUBLIC_KEY}`,
        },
        body: data,
      }
    );
  
    const response = await request.json();
    console.log(response);
  
  
    return response.data.cid;
  
  }