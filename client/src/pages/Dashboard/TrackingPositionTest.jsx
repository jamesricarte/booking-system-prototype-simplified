import React, { useEffect, useRef, useState } from "react";

const TrackingPositionTest = () => {
  const elementRef = useRef(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const updatePosition = () => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left,
      });
    }
  };

  useEffect(() => {
    updatePosition();

    window.addEventListener("scroll", updatePosition);
  }, []);
  return (
    <>
      <main className="flex flex-col items-center justify-center h-[1000px]">
        <div>
          <p>top: {position.top}</p>
          <p>left: {position.left}</p>
        </div>
        <div className="p-6 text-white bg-blue-500" ref={elementRef}></div>
      </main>
    </>
  );
};

export default TrackingPositionTest;
