// type props = {
//     size?: number;
//     isEnabled?: boolean;
//     message?: string;
// }
// export const Loader: React.FC<props> = ({ size, isEnabled,message }: props) => {
//   if (!isEnabled) return null;
//   const style = {
//     position: "absolute" as "absolute",
//     top: "50%",
//     width:"100px",
//     height:"100px",
//     left: "50%",
//     backgroundColor: "rgba(0,0,0,0.5)",
//     transform: "translate(-50%, -50%)",
//     borderRadius:"50%",
//     zIndex: 9999,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     color: "#fff",
//     fontSize: "1.2rem",
//   }
//   return (
//     <div style={style}>
//         <p>{message || "Loading..."}</p>
//     </div>
//   );
// }


import React from "react";

interface LoaderProps {
  size?: number;
  isEnabled: boolean;
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size=90, isEnabled, message }) => {
  if (!isEnabled) return null;

  const style: React.CSSProperties = {
    position: "fixed",
    top: "50%",
    left: "50%",
    width: `${size}px`,
    height: `${size}px`,
    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "bold",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    animation: "pulse 1.5s infinite ease-in-out",
  };

  return (
    <div style={style}>
      <p style={{ textAlign: "center", margin: 0 }}>
        {message || "Loading..."}
      </p>
      <style>
        {`
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.1); }
            100% { transform: translate(-50%, -50%) scale(1); }
          }
        `}
      </style>
    </div>
  );
};


