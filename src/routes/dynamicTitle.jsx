import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import titlesConfig from "./titlesConfig";

const DynamicTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const title = titlesConfig[location.pathname] || "Camper Stories";
    document.title = title;
  }, [location]);

  return null;
};

export default DynamicTitle;
