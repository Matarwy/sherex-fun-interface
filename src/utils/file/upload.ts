const pinataPublicURL = "https://ipfs.io/ipfs/";


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
    const PINATA_PUBLIC_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkMzA4OGNjZi1kMTg1LTQ2MGMtYjE5MS05YzhiMTIzMGEwZGQiLCJlbWFpbCI6InRocmlsbHNlZWtlci5ud0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMzAxODQzZDA5OGFlYWVmN2U0M2YiLCJzY29wZWRLZXlTZWNyZXQiOiJiYzhhMDVkMTEyNDcyNTJhYWVhZGJhOGE2MWRjNTcyYjJmOGNlNGMyMjg4YjcwNjQwNWZhMDY5N2YzZWY5ZGZkIiwiZXhwIjoxNzgxMzg2Mjg0fQ.diAjGwignEsmvmH3ajTMjMi-KE4_JsVYRQL_-RxBu3Q`
  
  
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