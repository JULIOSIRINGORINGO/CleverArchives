"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/Button';
import { Slider } from '../ui/Slider';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface AvatarCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export const AvatarCropper: React.FC<AvatarCropperProps> = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number, y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropAreaComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any
  ): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl bg-card rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[80vh] md:h-auto">
        {/* Header */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">Sesuaikan Foto</h3>
            <p className="text-xs text-muted-foreground font-medium">Geser dan perbesar untuk posisi terbaik</p>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 min-h-[300px] md:min-h-[400px] bg-muted/20">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={onCropAreaComplete}
            onZoomChange={onZoomChange}
          />
        </div>

        {/* Controls */}
        <div className="p-8 space-y-8 bg-card">
          <div className="flex items-center gap-6">
            <ZoomOut size={18} className="text-muted-foreground" />
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onValueChange={onZoomChange}
            />
            <ZoomIn size={18} className="text-muted-foreground" />
          </div>

          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              onClick={onCancel}
              className="flex-1 h-14 rounded-2xl font-black"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 h-14 rounded-2xl font-black shadow-xl shadow-primary/20 bg-primary"
            >
              <Check size={18} className="mr-2" />
              Gunakan Foto Ini
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
