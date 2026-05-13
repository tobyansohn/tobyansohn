import { useState, useEffect } from "react";

export default function PageTransition({ children, locationKey }) {
  const [displayed, setDisplayed] = useState(children);
  const [stage, setStage] = useState("visible"); // 'visible' | 'out' | 'in'

  useEffect(() => {
    setStage("out");
    const t1 = setTimeout(() => {
      setDisplayed(children);
      setStage("in");
    }, 350);
    const t2 = setTimeout(() => setStage("visible"), 650);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [locationKey]);

  const opacity =
    stage === "out" ? "opacity-0 translate-y-3" :
    stage === "in"  ? "opacity-0 -translate-y-2" :
    "opacity-100 translate-y-0";

  return (
    <div className={`transition-all duration-300 ease-out ${opacity}`}>
      {displayed}
    </div>
  );
}
