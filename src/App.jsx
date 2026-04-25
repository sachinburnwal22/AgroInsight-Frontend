import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/test")
      .then((res) => {
        console.log(res.data);
        setData(res.data);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <div>
      <h1>AgroInsight 🌾</h1>
      <p>{data ? data.message : "Loading..."}</p>
    </div>
  );
}

export default App;
