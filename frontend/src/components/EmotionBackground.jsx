import React, { useEffect, useRef, useState } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

// Background images
import happyBg from "../assets/happy-bg.png";
import sadBg from "../assets/sad-bg.png";
import angryBg from "../assets/angry-bg.png";
import fearBg from "../assets/fear-bg.png";
import surpriseBg from "../assets/surprise-bg.png";
import disgustBg from "../assets/disgust-bg.png";
import neutralBg from "../assets/neutral-bg.png";

export default function EmotionBackground({ children }) {
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const [emotion, setEmotion] = useState("neutral");

  const emotionThemes = {
    happy: {
      bgImage: happyBg,
      overlay: "bg-yellow-200 bg-opacity-20",
      elements: [],
    },
    sad: {
      bgImage: sadBg,
      overlay: "bg-blue-400 bg-opacity-30",
      elements: [],
    },
    angry: {
      bgImage: angryBg,
      overlay: "bg-red-500 bg-opacity-30",
      elements: [],
    },
    fear: {
      bgImage: fearBg,
      overlay: "bg-indigo-900 bg-opacity-40",
      elements: [],
    },
    surprise: {
      bgImage: surpriseBg,
      overlay: "bg-purple-300 bg-opacity-30",
      elements: [],
    },
    disgust: {
      bgImage: disgustBg,
      overlay: "bg-green-300 bg-opacity-30",
      elements: [],
    },
    neutral: {
      bgImage: neutralBg,
      overlay: "bg-gray-200 bg-opacity-20",
      elements: [],
    },
  };

  useEffect(() => {
    let animationFrameId;

    const getDistance = (a, b) =>
      Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

    const detectEmotionFromLandmarks = (landmarks) => {
      const upperLip = landmarks[13];
      const lowerLip = landmarks[14];
      const leftEyeTop = landmarks[159];
      const leftEyeBottom = landmarks[145];
      const rightEyeTop = landmarks[386];
      const rightEyeBottom = landmarks[374];
      const leftBrow = landmarks[70];
      const rightBrow = landmarks[300];

      const mouthOpen = getDistance(upperLip, lowerLip);
      const leftEyeOpen = getDistance(leftEyeTop, leftEyeBottom);
      const rightEyeOpen = getDistance(rightEyeTop, rightEyeBottom);
      const browDistance = getDistance(leftBrow, rightBrow);

      let detected = "neutral";

      if (mouthOpen > 0.06 && leftEyeOpen > 0.025 && rightEyeOpen > 0.025) {
        detected = "surprise";
      } else if (mouthOpen > 0.05 && leftEyeOpen > 0.02) {
        detected = "happy";
      } else if (mouthOpen < 0.015 && browDistance < 0.07) {
        detected = "angry";
      } else if (leftEyeOpen < 0.015 && rightEyeOpen < 0.015) {
        detected = "sad";
      } else if (mouthOpen < 0.02 && browDistance > 0.09) {
        detected = "disgust";
      } else if (leftEyeOpen > 0.035 && mouthOpen > 0.02) {
        detected = "fear";
      }

      setEmotion(detected);
    };

    const runDetection = async () => {
      if (videoRef.current && faceLandmarkerRef.current) {
        const results = await faceLandmarkerRef.current.detectForVideo(
          videoRef.current,
          performance.now()
        );

        if (results.faceLandmarks?.length > 0) {
          detectEmotionFromLandmarks(results.faceLandmarks[0]);
        }
      }

      animationFrameId = requestAnimationFrame(runDetection);
    };

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });

        faceLandmarkerRef.current = faceLandmarker;

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        runDetection();
      } catch (error) {
        console.error("Error initializing face detection:", error);
      }
    };

    init();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const currentTheme = emotionThemes[emotion] || emotionThemes.neutral;

  return (
    <div className="relative w-full min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 w-screen h-screen -z-10 overflow-hidden transition-all duration-500"
        style={{
          backgroundImage: `url(${currentTheme.bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className={`absolute inset-0 ${currentTheme.overlay} transition-all duration-300`}
        ></div>

        {(currentTheme.elements || []).map((element, index) => (
          <div key={index} className={`absolute ${element.style}`}></div>
        ))}
      </div>

      {/* Hidden video */}
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />

      {/* Emotion Display */}
      <div className="absolute top-5 right-5 z-50 bg-white bg-opacity-80 text-black px-4 py-2 rounded-xl shadow-lg text-lg font-semibold backdrop-blur-sm">
        Emotion: <span className="capitalize">{emotion}</span>
      </div>

      {/* Children */}
      <div className="relative z-10">
        {typeof children === "function"
          ? children({ currentEmotion: emotion })
          : children}
      </div>
    </div>
  );
}
