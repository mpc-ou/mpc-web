"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

// Utility to convert a File into a preview URL
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Utility to create a cropped image HTMLCanvasElement
export async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set intended output to square
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped portion
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

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.9
    );
  });
}

interface ImageCropperModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onConfirm: (croppedBlob: Blob) => void;
  aspect?: number;
}

export function ImageCropperModal({ isOpen, onOpenChange, imageSrc, onConfirm, aspect = 1 }: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) {
      return;
    }
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(croppedBlob);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent className='m-2 max-w-full rounded-xl sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Mô phỏng hình đại diện</DialogTitle>
          <DialogDescription>Kéo thả hoặc thu phóng để chọn phần hình ảnh phù hợp.</DialogDescription>
        </DialogHeader>
        <div className='relative h-[300px] w-full sm:h-[400px]'>
          {imageSrc && (
            <Cropper
              aspect={aspect}
              crop={crop}
              cropShape={aspect === 1 ? "round" : "rect"}
              image={imageSrc}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              zoom={zoom}
            />
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label className='font-medium text-sm'>Thu phóng</label>
          <input
            className='w-full'
            max={3}
            min={1}
            onChange={(e) => setZoom(Number(e.target.value))}
            step={0.1}
            type='range'
            value={zoom}
          />
        </div>
        <DialogFooter className='mt-4 flex gap-2 sm:justify-end'>
          <Button onClick={() => onOpenChange(false)} variant='outline'>
            Hủy bỏ
          </Button>
          <Button onClick={handleConfirm}>Xong</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
