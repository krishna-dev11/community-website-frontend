import React from "react";
import Template from "../Components/Core/Auth/Template";

const Login = () => {
  return (
    <Template
      title="समाज पोर्टल में आपका स्वागत है"
      desc1="पंजीकृत एवं स्वीकृत सदस्य और अधिकृत प्रशासक अपने खाते से सुरक्षित रूप से लॉगिन कर सकते हैं।"
      desc2="नए सदस्य के आवेदन की समिति द्वारा समीक्षा एवं स्वीकृति के बाद ही पोर्टल लॉगिन उपलब्ध होता है।"
      formtype="login"
    />
  );
};

export default Login;