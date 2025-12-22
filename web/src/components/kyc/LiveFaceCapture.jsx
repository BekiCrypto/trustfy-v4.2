import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function LiveFaceCapture({ onCapture, capturedImage }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(t('kyc.errors.cameraAccess'));
      toast.error(t('kyc.toast.cameraDenied'));
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        stopCamera();
        toast.success(t('kyc.toast.photoCaptured'));
      }, 'image/jpeg', 0.95);
    }
  };

  const retake = () => {
    onCapture(null);
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative">
        {!capturedImage && !isCameraActive && (
          <div className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 hover:border-blue-500 transition-colors">
            <Camera className="w-12 h-12 text-slate-500 mb-3" />
            <p className="text-slate-400 text-sm mb-4">Use live camera for face verification</p>
            <Button
              type="button"
              onClick={startCamera}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
            {error && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        )}

        {isCameraActive && !capturedImage && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-xl border-2 border-blue-500 shadow-lg shadow-blue-500/20"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Face Guide Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-80 border-4 border-blue-500/50 rounded-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 bg-blue-500/90 px-3 py-1 rounded-full text-xs text-white font-medium">
                  Position your face here
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
                className="bg-slate-900/80 border-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={capturePhoto}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture Photo
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="relative">
            <img
              src={URL.createObjectURL(capturedImage)}
              alt="Captured selfie"
              className="w-full rounded-xl border-2 border-emerald-500 shadow-lg shadow-emerald-500/20"
            />
            <div className="absolute top-4 right-4 bg-emerald-500/90 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Photo Captured</span>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Button
                type="button"
                variant="outline"
                onClick={retake}
                className="bg-slate-900/80 border-slate-600"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Photo
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-slate-300">
            <p className="font-medium text-blue-400 mb-1">Live Face Verification</p>
            <ul className="space-y-1 text-slate-400">
              <li>• Ensure good lighting and face the camera directly</li>
              <li>• Remove glasses, hats, or face coverings</li>
              <li>• Hold your ID document next to your face</li>
              <li>• Make sure both your face and document are clearly visible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
